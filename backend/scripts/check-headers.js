import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const TEST_ENDPOINT = '/welcome';

async function checkHeaders() {
  console.log('🔍 检查响应头中的限流信息');
  console.log('=' .repeat(50));
  
  try {
    // 发送一个请求并检查响应头
    const response = await fetch(`${BASE_URL}${TEST_ENDPOINT}`);
    
    console.log(`📍 请求端点: ${BASE_URL}${TEST_ENDPOINT}`);
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    console.log('\n📋 所有响应头:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n🎯 限流相关响应头:');
    
    // 检查标准限流头
    const rateLimitLimit = response.headers.get('RateLimit-Limit');
    const rateLimitRemaining = response.headers.get('RateLimit-Remaining');
    const rateLimitReset = response.headers.get('RateLimit-Reset');
    const rateLimitUsed = response.headers.get('RateLimit-Used');
    
    // 检查传统限流头
    const xRateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const xRateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const xRateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    // 检查其他相关头
    const retryAfter = response.headers.get('Retry-After');
    
    console.log(`   RateLimit-Limit: ${rateLimitLimit || '未设置'}`);
    console.log(`   RateLimit-Remaining: ${rateLimitRemaining || '未设置'}`);
    console.log(`   RateLimit-Reset: ${rateLimitReset || '未设置'}`);
    console.log(`   RateLimit-Used: ${rateLimitUsed || '未设置'}`);
    console.log(`   X-RateLimit-Limit: ${xRateLimitLimit || '未设置'}`);
    console.log(`   X-RateLimit-Remaining: ${xRateLimitRemaining || '未设置'}`);
    console.log(`   X-RateLimit-Reset: ${xRateLimitReset || '未设置'}`);
    console.log(`   Retry-After: ${retryAfter || '未设置'}`);
    
    // 分析配置
    console.log('\n⚙️  当前配置分析:');
    console.log(`   standardHeaders: true  → 应该返回 RateLimit-* 头`);
    console.log(`   legacyHeaders: false   → 不返回 X-RateLimit-* 头`);
    
    if (rateLimitLimit && rateLimitRemaining) {
      console.log('\n✅ 标准限流头正常工作');
    } else {
      console.log('\n❌ 标准限流头未设置');
    }
    
    if (xRateLimitLimit || xRateLimitRemaining) {
      console.log('⚠️  传统限流头仍然存在（不应该）');
    } else {
      console.log('✅ 传统限流头已正确禁用');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 运行检查
checkHeaders(); 