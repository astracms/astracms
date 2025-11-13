#!/bin/bash

# ===========================================
# AstraCMS Import Migration Script
# Migrates all @marble/* imports to @astracms/*
# ===========================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/.backup-$(date +%Y%m%d-%H%M%S)"
DRY_RUN=false
VERBOSE=false
CHANGED_FILES=0

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Preview changes without modifying files"
            echo "  --verbose    Show detailed output"
            echo "  --help       Show this help message"
            echo ""
            echo "This script migrates all @marble/* imports to @astracms/* in the codebase."
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Function to print colored messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Function to create backup
create_backup() {
    if [ "$DRY_RUN" = false ]; then
        log_info "Creating backup at $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"

        # Copy relevant directories
        for dir in apps packages; do
            if [ -d "$PROJECT_ROOT/$dir" ]; then
                cp -r "$PROJECT_ROOT/$dir" "$BACKUP_DIR/"
            fi
        done

        log_success "Backup created successfully"
    else
        log_info "[DRY RUN] Would create backup at $BACKUP_DIR"
    fi
}

# Function to process a single file
process_file() {
    local file="$1"
    local temp_file="${file}.tmp"
    local has_changes=false

    # Check if file contains @marble imports
    if grep -q "@marble" "$file" 2>/dev/null; then
        log_verbose "Processing: $file"

        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would update: $file"

            # Show what would change
            if [ "$VERBOSE" = true ]; then
                echo "  Changes:"
                grep "@marble" "$file" | while read -r line; do
                    echo "    - $line"
                    echo "    + ${line//@marble/@astracms}"
                done
            fi

            ((CHANGED_FILES++))
        else
            # Create temporary file with replacements
            sed 's/@marble/@astracms/g' "$file" > "$temp_file"

            # Check if changes were made
            if ! diff -q "$file" "$temp_file" > /dev/null; then
                mv "$temp_file" "$file"
                log_success "Updated: $file"
                has_changes=true
                ((CHANGED_FILES++))
            else
                rm "$temp_file"
            fi
        fi
    fi

    return 0
}

# Function to update specific text references
update_text_references() {
    log_info "Updating text references..."

    # Update wrangler.toml
    local wrangler_file="$PROJECT_ROOT/apps/api/wrangler.toml"
    if [ -f "$wrangler_file" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would update wrangler.toml: marble-api → astracms-api"
        else
            sed -i.bak 's/marble-api/astracms-api/g' "$wrangler_file"
            rm -f "${wrangler_file}.bak"
            log_success "Updated wrangler.toml"
        fi
    fi

    # Update API hello message
    local app_file="$PROJECT_ROOT/apps/api/src/app.ts"
    if [ -f "$app_file" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would update app.ts: Hello from marble → Hello from AstraCMS"
        else
            sed -i.bak 's/Hello from marble/Hello from AstraCMS/g' "$app_file"
            rm -f "${app_file}.bak"
            log_success "Updated app.ts"
        fi
    fi

    # Update texture references in login/register pages
    local files_with_textures=(
        "$PROJECT_ROOT/apps/cms/src/app/(auth)/login/page.tsx"
        "$PROJECT_ROOT/apps/cms/src/app/(auth)/register/page.tsx"
    )

    for file in "${files_with_textures[@]}"; do
        if [ -f "$file" ]; then
            if [ "$DRY_RUN" = true ]; then
                echo -e "${YELLOW}[DRY RUN]${NC} Would update texture references in: $(basename "$file")"
            else
                sed -i.bak 's/marble-light\.avif/astracms-light.avif/g' "$file"
                sed -i.bak 's/marble-dark\.avif/astracms-dark.avif/g' "$file"
                rm -f "${file}.bak"
                log_success "Updated texture references in: $(basename "$file")"
            fi
        fi
    done

    # Update MarbleIcon references
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would update MarbleIcon → AstraCMSIcon references"
    else
        find "$PROJECT_ROOT/apps/cms" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "MarbleIcon" {} \; 2>/dev/null | while read -r file; do
            sed -i.bak 's/MarbleIcon/AstraCMSIcon/g' "$file"
            sed -i.bak 's/marble"/astracms"/g' "$file"
            sed -i.bak 's/\/marble/\/astracms/g' "$file"
            rm -f "${file}.bak"
            log_success "Updated icon references in: $(basename "$file")"
        done
    fi
}

# Function to update database example
update_database_config() {
    log_info "Updating database configuration examples..."

    local db_env_example="$PROJECT_ROOT/packages/db/.env.example"
    if [ -f "$db_env_example" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would update database .env.example"
        else
            sed -i.bak 's/usemarble/astracms/g' "$db_env_example"
            sed -i.bak 's/justusemarble/justastracms/g' "$db_env_example"
            sed -i.bak 's/marble/astracms/g' "$db_env_example"
            rm -f "${db_env_example}.bak"
            log_success "Updated database .env.example"
        fi
    fi
}

# Main execution
main() {
    echo "========================================="
    echo "   AstraCMS Import Migration Script"
    echo "========================================="
    echo ""

    if [ "$DRY_RUN" = true ]; then
        log_warning "Running in DRY RUN mode - no files will be modified"
        echo ""
    fi

    # Change to project root
    cd "$PROJECT_ROOT"

    # Create backup (unless dry run)
    if [ "$DRY_RUN" = false ]; then
        create_backup
    fi

    # Process TypeScript/JavaScript files
    log_info "Searching for files with @marble imports..."

    # Find all relevant files
    file_extensions=("*.ts" "*.tsx" "*.js" "*.jsx" "*.mjs" "*.cjs")
    search_dirs=("apps" "packages")

    for dir in "${search_dirs[@]}"; do
        if [ -d "$dir" ]; then
            for ext in "${file_extensions[@]}"; do
                find "$dir" -type f -name "$ext" 2>/dev/null | while read -r file; do
                    process_file "$file"
                done
            done
        fi
    done

    # Update other text references
    update_text_references

    # Update database configuration
    update_database_config

    # Summary
    echo ""
    echo "========================================="
    if [ "$DRY_RUN" = true ]; then
        log_info "Dry run complete!"
        log_info "Files that would be changed: $CHANGED_FILES"
        echo ""
        log_warning "Run without --dry-run to apply changes"
    else
        log_success "Migration complete!"
        log_success "Files updated: $CHANGED_FILES"
        log_info "Backup saved at: $BACKUP_DIR"
        echo ""
        log_info "Next steps:"
        echo "  1. Review the changes with: git diff"
        echo "  2. Test the application: pnpm dev"
        echo "  3. If everything works, commit the changes"
        echo "  4. If issues arise, restore from backup: $BACKUP_DIR"
    fi
    echo "========================================="
}

# Run main function
main

# Exit successfully
exit 0
