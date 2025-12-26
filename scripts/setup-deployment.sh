#!/bin/bash

# Scottish Inn & Suites - Deployment Setup Script
# This script helps you configure automated deployments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${BLUE}????????????????????????????????????????????????????${NC}"
echo -e "${BLUE}?   Scottish Inn & Suites - Deployment Setup      ?${NC}"
echo -e "${BLUE}????????????????????????????????????????????????????${NC}"
echo ""

echo -e "${YELLOW}This script will help you set up automated deployments to Render.${NC}"
echo ""

# Step 1: Check if user has Render account
echo -e "${BLUE}Step 1: Render Account${NC}"
echo "Do you have a Render.com account? (y/n)"
read -p "> " has_account

if [ "$has_account" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Please create a Render account first:${NC}"
    echo "  1. Go to https://render.com"
    echo "  2. Sign up with GitHub"
    echo "  3. Authorize Render to access your repository"
    echo ""
    echo "Run this script again after creating your account."
    exit 0
fi

# Step 2: Get API Key
echo ""
echo -e "${BLUE}Step 2: Render API Key${NC}"
echo "Follow these steps to get your API key:"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Click your avatar ? Account Settings"
echo "  3. Navigate to 'API Keys'"
echo "  4. Click 'Create API Key'"
echo "  5. Copy the key (starts with rnd_...)"
echo ""
read -p "Enter your Render API Key: " api_key

if [ -z "$api_key" ]; then
    echo -e "${RED}? API key is required${NC}"
    exit 1
fi

# Step 3: Get Service IDs
echo ""
echo -e "${BLUE}Step 3: Service IDs${NC}"
echo "You need to create services in Render first using the Blueprint."
echo ""
echo "Option 1: Use Blueprint (Recommended)"
echo "  1. Go to Render Dashboard ? New ? Blueprint"
echo "  2. Select 'Scottish-Inn' repository"
echo "  3. Render will create all services from render.yaml"
echo "  4. Copy service IDs from URLs (srv-xxxxx)"
echo ""
echo "Option 2: Manual Service Creation"
echo "  Create services manually and note the IDs"
echo ""

read -p "Have you created the services? (y/n): " services_created

if [ "$services_created" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Please create services first, then run this script again.${NC}"
    exit 0
fi

echo ""
read -p "Enter Backend Service ID (srv-xxxxx): " backend_id
read -p "Enter Frontend Service ID (srv-xxxxx): " frontend_id

if [ -z "$backend_id" ] || [ -z "$frontend_id" ]; then
    echo -e "${RED}? Both service IDs are required${NC}"
    exit 1
fi

# Step 4: Configure GitHub Secrets
echo ""
echo -e "${BLUE}Step 4: GitHub Secrets${NC}"
echo "Now we'll set up GitHub repository secrets."
echo ""
echo "Go to your GitHub repository:"
echo "  https://github.com/alexp404/Scottish-Inn/settings/secrets/actions"
echo ""
echo "Add these secrets:"
echo ""
echo -e "${GREEN}RENDER_API_KEY${NC}"
echo "  Value: $api_key"
echo ""
echo -e "${GREEN}RENDER_SERVICE_ID_BACKEND${NC}"
echo "  Value: $backend_id"
echo ""
echo -e "${GREEN}RENDER_SERVICE_ID_FRONTEND${NC}"
echo "  Value: $frontend_id"
echo ""

read -p "Have you added all three secrets to GitHub? (y/n): " secrets_added

if [ "$secrets_added" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Please add the secrets to GitHub, then run this script again.${NC}"
    exit 0
fi

# Step 5: Save to .env.deployment (optional)
echo ""
echo -e "${BLUE}Step 5: Save Configuration${NC}"
echo "Do you want to save these settings locally for manual deployments? (y/n)"
read -p "> " save_local

if [ "$save_local" = "y" ]; then
    cat > .env.deployment << EOF
# Render Deployment Configuration
# Generated on $(date)

export RENDER_API_KEY="$api_key"
export RENDER_SERVICE_ID_BACKEND="$backend_id"
export RENDER_SERVICE_ID_FRONTEND="$frontend_id"

# Usage:
# source .env.deployment
# ./scripts/deploy.sh
EOF

    echo ""
    echo -e "${GREEN}? Configuration saved to .env.deployment${NC}"
    echo ""
    echo "To use for manual deployments:"
    echo "  source .env.deployment"
    echo "  ./scripts/deploy.sh"
fi

# Step 6: Test deployment
echo ""
echo -e "${BLUE}Step 6: Test Deployment (Optional)${NC}"
echo "Would you like to trigger a test deployment now? (y/n)"
read -p "> " test_deploy

if [ "$test_deploy" = "y" ]; then
    echo ""
    echo -e "${YELLOW}Testing backend deployment...${NC}"
    
    response=$(curl -s -X POST "https://api.render.com/v1/services/$backend_id/deploys" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": "clear"}')
    
    if echo "$response" | grep -q "error"; then
        echo -e "${RED}? Test deployment failed${NC}"
        echo "$response"
    else
        echo -e "${GREEN}? Test deployment triggered successfully!${NC}"
        echo ""
        echo "Monitor at: https://dashboard.render.com"
    fi
fi

# Final summary
echo ""
echo -e "${GREEN}????????????????????????????????????????????????????${NC}"
echo -e "${GREEN}?   Setup Complete! ??                             ?${NC}"
echo -e "${GREEN}????????????????????????????????????????????????????${NC}"
echo ""
echo -e "${BLUE}What happens next:${NC}"
echo ""
echo "1. Push code to master branch:"
echo "   git push origin master"
echo ""
echo "2. GitHub Actions will automatically:"
echo "   ? Build and test your code"
echo "   ? Deploy to Render if tests pass"
echo ""
echo "3. Monitor deployment:"
echo "   GitHub: https://github.com/alexp404/Scottish-Inn/actions"
echo "   Render:  https://dashboard.render.com"
echo ""
echo -e "${BLUE}Your services will be available at:${NC}"
echo "  Frontend: https://scottish-inn-frontend.onrender.com"
echo "  Backend:  https://scottish-inn-backend.onrender.com"
echo ""
echo -e "${YELLOW}?? Documentation:${NC}"
echo "  Read DEPLOYMENT_GUIDE.md for detailed information"
echo ""
