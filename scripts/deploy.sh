#!/bin/bash

# Scottish Inn & Suites - Quick Deployment Script
# This script helps with manual deployments to Render

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}??????????????????????????????????????????????${NC}"
echo -e "${BLUE}?   Scottish Inn & Suites Deployment        ?${NC}"
echo -e "${BLUE}??????????????????????????????????????????????${NC}"
echo ""

# Check if API key is set
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}? Error: RENDER_API_KEY not set${NC}"
    echo ""
    echo "Please set your Render API key:"
    echo "  export RENDER_API_KEY=rnd_xxxxxxxxxxxx"
    echo ""
    exit 1
fi

# Function to deploy a service
deploy_service() {
    local service_id=$1
    local service_name=$2
    
    echo -e "${YELLOW}?? Deploying ${service_name}...${NC}"
    
    response=$(curl -s -X POST "https://api.render.com/v1/services/${service_id}/deploys" \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": "clear"}')
    
    if echo "$response" | grep -q "error"; then
        echo -e "${RED}? Failed to deploy ${service_name}${NC}"
        echo "$response"
        return 1
    else
        echo -e "${GREEN}? ${service_name} deployment triggered${NC}"
        return 0
    fi
}

# Main deployment options
echo "Select deployment option:"
echo "1) Deploy Backend only"
echo "2) Deploy Frontend only"
echo "3) Deploy Both (Backend + Frontend)"
echo "4) Check service status"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        if [ -z "$RENDER_SERVICE_ID_BACKEND" ]; then
            echo -e "${RED}? RENDER_SERVICE_ID_BACKEND not set${NC}"
            exit 1
        fi
        deploy_service "$RENDER_SERVICE_ID_BACKEND" "Backend"
        ;;
    2)
        if [ -z "$RENDER_SERVICE_ID_FRONTEND" ]; then
            echo -e "${RED}? RENDER_SERVICE_ID_FRONTEND not set${NC}"
            exit 1
        fi
        deploy_service "$RENDER_SERVICE_ID_FRONTEND" "Frontend"
        ;;
    3)
        if [ -z "$RENDER_SERVICE_ID_BACKEND" ] || [ -z "$RENDER_SERVICE_ID_FRONTEND" ]; then
            echo -e "${RED}? Service IDs not set${NC}"
            exit 1
        fi
        deploy_service "$RENDER_SERVICE_ID_BACKEND" "Backend"
        echo ""
        deploy_service "$RENDER_SERVICE_ID_FRONTEND" "Frontend"
        ;;
    4)
        echo -e "${BLUE}?? Checking service status...${NC}"
        echo ""
        echo "Check status at: https://dashboard.render.com"
        ;;
    5)
        echo -e "${BLUE}?? Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}? Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}??????????????????????????????????????????????${NC}"
echo -e "${GREEN}?   Deployment Complete!                     ?${NC}"
echo -e "${GREEN}??????????????????????????????????????????????${NC}"
echo ""
echo -e "${BLUE}?? Monitor deployment:${NC}"
echo "  https://dashboard.render.com"
echo ""
echo -e "${BLUE}?? Service URLs:${NC}"
echo "  Frontend: https://scottish-inn-frontend.onrender.com"
echo "  Backend:  https://scottish-inn-backend.onrender.com"
echo ""
