#!/bin/bash
#
# 触发每日精选内容生成
# 
# 用法:
#   ./scripts/trigger-daily-practice.sh           # 使用生产环境
#   ./scripts/trigger-daily-practice.sh --local   # 使用本地开发环境
#   ./scripts/trigger-daily-practice.sh --dry-run # 只显示命令，不执行
#
# 环境变量:
#   CRON_SECRET - 如果不设置，脚本会尝试从 .env.production.local 读取
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
PROD_URL="https://ai-trend-radar.vercel.app/api/cron/daily-practice"
LOCAL_URL="http://localhost:3000/api/cron/daily-practice"
USE_LOCAL=false
DRY_RUN=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --local|-l)
            USE_LOCAL=true
            shift
            ;;
        --dry-run|-d)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --local, -l     使用本地开发环境 (localhost:3000)"
            echo "  --dry-run, -d   只显示命令，不执行"
            echo "  --help, -h      显示帮助信息"
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            exit 1
            ;;
    esac
done

# 确定 URL
if [ "$USE_LOCAL" = true ]; then
    API_URL="$LOCAL_URL"
    echo -e "${BLUE}🏠 使用本地环境${NC}"
else
    API_URL="$PROD_URL"
    echo -e "${BLUE}🌐 使用生产环境${NC}"
fi

# 获取 CRON_SECRET
if [ -z "$CRON_SECRET" ]; then
    # 尝试从 .env.production.local 读取
    ENV_FILE=".env.production.local"
    if [ -f "$ENV_FILE" ]; then
        CRON_SECRET=$(grep "^CRON_SECRET=" "$ENV_FILE" | cut -d'"' -f2)
        echo -e "${GREEN}✓ 从 $ENV_FILE 读取 CRON_SECRET${NC}"
    fi
fi

# 如果仍然没有 CRON_SECRET，尝试从 Vercel 拉取
if [ -z "$CRON_SECRET" ]; then
    echo -e "${YELLOW}⚠ CRON_SECRET 未设置，尝试从 Vercel 拉取...${NC}"
    vercel env pull .env.production.local --environment=production 2>/dev/null || true
    
    if [ -f ".env.production.local" ]; then
        CRON_SECRET=$(grep "^CRON_SECRET=" ".env.production.local" | cut -d'"' -f2)
    fi
fi

# 验证 CRON_SECRET
if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}✗ 错误: CRON_SECRET 未设置${NC}"
    echo "请设置环境变量或确保 .env.production.local 文件存在"
    exit 1
fi

echo -e "${GREEN}✓ CRON_SECRET 已加载${NC}"
echo ""

# 构建命令
CMD="curl -X GET \"$API_URL\" -H \"Authorization: Bearer $CRON_SECRET\""

# Dry run 模式
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[Dry Run] 将执行以下命令:${NC}"
    echo "$CMD"
    exit 0
fi

# 执行请求
echo -e "${BLUE}🚀 触发每日精选生成...${NC}"
echo ""

RESPONSE=$(curl -s -X GET "$API_URL" -H "Authorization: Bearer $CRON_SECRET")

# 解析响应
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ 生成成功!${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}✗ 生成失败${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

