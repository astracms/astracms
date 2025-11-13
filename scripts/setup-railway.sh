#!/bin/bash

# ===========================================
# AstraCMS Railway Setup Automation Script
# ===========================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/deployment/.env.production"

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

log_step() {
    echo -e "${MAGENTA}[STEP]${NC} $1"
}

log_detail() {
    echo -e "${CYAN}  →${NC} $1"
}

# Function to print header
print_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║           AstraCMS Railway Setup Automation                     ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Railway CLI
install_railway_cli() {
    log_step "Installing Railway CLI..."

    if command_exists railway; then
        log_success "Railway CLI already installed"
        railway --version
        return 0
    fi

    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            log_detail "Installing via Homebrew..."
            brew install railway
        else
            log_detail "Installing via npm..."
            npm install -g @railway/cli
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        log_detail "Installing via npm..."
        npm install -g @railway/cli
    else
        log_error "Unsupported OS. Please install Railway CLI manually:"
        log_detail "https://docs.railway.app/develop/cli"
        exit 1
    fi

    if command_exists railway; then
        log_success "Railway CLI installed successfully"
        railway --version
    else
        log_error "Failed to install Railway CLI"
        exit 1
    fi
}

# Function to login to Railway
railway_login() {
    log_step "Logging into Railway..."

    if railway whoami >/dev/null 2>&1; then
        log_success "Already logged in to Railway"
        railway whoami
        return 0
    fi

    log_detail "Opening browser for authentication..."
    railway login

    if railway whoami >/dev/null 2>&1; then
        log_success "Successfully logged in"
        railway whoami
    else
        log_error "Failed to login to Railway"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    local missing_deps=()

    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("Node.js (https://nodejs.org)")
    else
        log_detail "Node.js $(node --version) ✓"
    fi

    # Check npm
    if ! command_exists npm; then
        missing_deps+=("npm")
    else
        log_detail "npm $(npm --version) ✓"
    fi

    # Check pnpm
    if ! command_exists pnpm; then
        log_warning "pnpm not found. Installing..."
        npm install -g pnpm
    else
        log_detail "pnpm $(pnpm --version) ✓"
    fi

    # Check git
    if ! command_exists git; then
        missing_deps+=("git")
    else
        log_detail "git $(git --version | head -n1) ✓"
    fi

    # Check openssl
    if ! command_exists openssl; then
        missing_deps+=("openssl")
    else
        log_detail "openssl ✓"
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi

    log_success "All prerequisites met"
}

# Function to generate secrets
generate_secrets() {
    log_step "Generating required secrets..."

    # Generate BETTER_AUTH_SECRET
    BETTER_AUTH_SECRET=$(openssl rand -base64 32)
    log_detail "BETTER_AUTH_SECRET generated ✓"

    # Generate MINIO_SECRET_KEY
    MINIO_SECRET_KEY=$(openssl rand -base64 32)
    log_detail "MINIO_SECRET_KEY generated ✓"

    # Generate API keys
    API_KEY=$(openssl rand -hex 32)
    log_detail "Generic API_KEY generated ✓"

    log_success "All secrets generated"
}

# Function to create environment file template
create_env_template() {
    log_step "Creating environment file template..."

    # Create deployment directory if it doesn't exist
    mkdir -p "$PROJECT_ROOT/deployment"

    if [ -f "$ENV_FILE" ]; then
        log_warning "Environment file already exists: $ENV_FILE"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing file"
            return 0
        fi
    fi

    cat > "$ENV_FILE" << EOF
# ================================================
# AstraCMS Production Environment Variables
# Generated: $(date)
# ================================================

# ================================================
# DATABASE (from Railway PostgreSQL)
# ================================================
# Get these from Railway PostgreSQL service -> Variables tab
DATABASE_URL=
DATABASE_PRIVATE_URL=

# ================================================
# REDIS (from Railway Redis)
# ================================================
# Get these from Railway Redis service -> Variables tab
REDIS_URL=
REDIS_TOKEN=

# ================================================
# AUTHENTICATION
# ================================================
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=https://astracms.com

# ================================================
# OAUTH - GOOGLE
# ================================================
# Create OAuth app at: https://console.cloud.google.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ================================================
# OAUTH - GITHUB
# ================================================
# Create OAuth app at: https://github.com/settings/developers
GITHUB_ID=
GITHUB_SECRET=

# ================================================
# EMAIL (RESEND)
# ================================================
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=

# ================================================
# BILLING (POLAR)
# ================================================
# Get these from: https://polar.sh/dashboard
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_SUCCESS_URL=https://astracms.com/api/polar/success?checkout_id={CHECKOUT_ID}
POLAR_HOBBY_PRODUCT_ID=
POLAR_PRO_PRODUCT_ID=
POLAR_TEAM_PRODUCT_ID=

# ================================================
# APPLICATION URLS
# ================================================
NEXT_PUBLIC_APP_URL=https://astracms.com
ASTRACMS_API_URL=https://api.astracms.com/v1

# ================================================
# STORAGE (MINIO)
# ================================================
# Configure after deploying Minio to Railway
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
MINIO_BUCKET_NAME=astracms-media
MINIO_PUBLIC_URL=

# ================================================
# WEBHOOKS (QSTASH - UPSTASH)
# ================================================
# Get from: https://upstash.com/
QSTASH_TOKEN=

# ================================================
# AI (OPTIONAL)
# ================================================
AI_GATEWAY_API_KEY=

# ================================================
# NODE ENVIRONMENT
# ================================================
NODE_ENV=production
PORT=3000
EOF

    log_success "Environment file created: $ENV_FILE"
    log_warning "⚠️  IMPORTANT: Fill in the empty values before deployment"
}

# Function to create Railway project
create_railway_project() {
    log_step "Creating Railway project..."

    read -p "Enter project name (default: astracms-production): " project_name
    project_name=${project_name:-astracms-production}

    log_detail "Creating project: $project_name"

    # Create project using Railway CLI
    if railway init --name "$project_name"; then
        log_success "Railway project created: $project_name"
    else
        log_error "Failed to create Railway project"
        exit 1
    fi
}

# Function to setup services guide
setup_services_guide() {
    log_step "Service Setup Guide..."

    cat << EOF

${CYAN}═══════════════════════════════════════════════════════════════${NC}
${CYAN}  NEXT: Add Services to Railway Project${NC}
${CYAN}═══════════════════════════════════════════════════════════════${NC}

${YELLOW}1. PostgreSQL Database${NC}
   → Go to Railway dashboard
   → Click "+ New"
   → Select "Database"
   → Choose "Add PostgreSQL"
   → Copy DATABASE_URL from Variables tab

${YELLOW}2. Redis Cache${NC}
   → Click "+ New"
   → Select "Database"
   → Choose "Add Redis"
   → Copy REDIS_URL from Variables tab

${YELLOW}3. Minio Storage${NC}
   → Click "+ New"
   → Select "Empty Service"
   → Add Docker image: minio/minio:latest
   → Set start command: minio server /data --console-address ":9001"
   → Add environment variables:
     MINIO_ROOT_USER=minioadmin
     MINIO_ROOT_PASSWORD=$MINIO_SECRET_KEY
   → Expose ports: 9000, 9001
   → Wait for deployment
   → Access console at port 9001
   → Create bucket: astracms-media
   → Set bucket policy to public read
   → Configure CORS

${YELLOW}4. Update Environment File${NC}
   → Edit: $ENV_FILE
   → Add all Database, Redis, and Minio URLs
   → Fill in OAuth credentials
   → Save the file

${CYAN}═══════════════════════════════════════════════════════════════${NC}

EOF
}

# Function to test connections
test_connections() {
    log_step "Testing service connections..."

    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found. Skipping connection tests."
        return 0
    fi

    # Source environment file
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    # Test PostgreSQL
    if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "" ]; then
        log_detail "Testing PostgreSQL connection..."
        if command_exists psql; then
            if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
                log_success "PostgreSQL connection successful"
            else
                log_warning "PostgreSQL connection failed"
            fi
        else
            log_warning "psql not installed, skipping PostgreSQL test"
        fi
    else
        log_warning "DATABASE_URL not set, skipping PostgreSQL test"
    fi

    # Test Redis
    if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" != "" ]; then
        log_detail "Testing Redis connection..."
        if command_exists redis-cli; then
            if redis-cli -u "$REDIS_URL" PING >/dev/null 2>&1; then
                log_success "Redis connection successful"
            else
                log_warning "Redis connection failed"
            fi
        else
            log_warning "redis-cli not installed, skipping Redis test"
        fi
    else
        log_warning "REDIS_URL not set, skipping Redis test"
    fi
}

# Function to print summary
print_summary() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║                    Setup Summary                                 ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    log_success "Railway CLI installed and authenticated"
    log_success "Secrets generated"
    log_success "Environment template created"
    echo ""
    log_info "Next steps:"
    echo "  1. Add services in Railway dashboard (PostgreSQL, Redis, Minio)"
    echo "  2. Copy service URLs to: $ENV_FILE"
    echo "  3. Configure OAuth apps and get credentials"
    echo "  4. Run 'railway link' to connect to your project"
    echo "  5. Proceed to Step 3 (API Migration)"
    echo ""
    log_warning "⚠️  Don't forget to:"
    echo "  - Save credentials in a secure password manager"
    echo "  - Never commit .env.production to git"
    echo "  - Review deployment/STEP2-GUIDE.md for detailed instructions"
    echo ""
}

# Main execution
main() {
    print_header

    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "Must be run from the astracms project root"
        exit 1
    fi

    log_info "Starting Railway setup for AstraCMS..."
    echo ""

    # Run setup steps
    check_prerequisites
    echo ""

    install_railway_cli
    echo ""

    railway_login
    echo ""

    generate_secrets
    echo ""

    create_env_template
    echo ""

    # Ask if user wants to create project now
    read -p "Create Railway project now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_railway_project
        echo ""
    else
        log_info "Skipping project creation. Run 'railway init' manually."
        echo ""
    fi

    setup_services_guide

    # Test connections if env file is populated
    read -p "Test service connections? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_connections
        echo ""
    fi

    print_summary

    log_success "Setup complete! 🚀"
}

# Run main function
main

exit 0
