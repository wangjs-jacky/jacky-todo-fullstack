import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const TEST_ENDPOINT = '/welcome';

// 测试函数：发送指定次数的请求
async function sendRequests(count) {
  console.log(`\n🚀 开始发送 ${count} 个请求...`);
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 1; i <= count; i++) {
    const promise = fetch(`${BASE_URL}${TEST_ENDPOINT}`)
      .then(async (response) => {
        const data = await response.json();
        return {
          requestId: i,
          status: response.status,
          statusText: response.statusText,
          data: data,
          headers: {
            'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining'),
            'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset'),
            'Retry-After': response.headers.get('Retry-After')
          }
        };
      })
      .catch((error) => {
        return {
          requestId: i,
          error: error.message,
          status: 'ERROR'
        };
      });
    
    promises.push(promise);
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  console.log(`⏱️  总耗时: ${endTime - startTime}ms`);
  
  return results;
}

// 分析结果
function analyzeResults(results) {
  console.log('\n📊 结果分析:');
  
  const successful = results.filter(r => r.status === 200);
  const rateLimited = results.filter(r => r.status === 429);
  const errors = results.filter(r => r.status === 'ERROR');
  
  console.log(`✅ 成功请求: ${successful.length}`);
  console.log(`🚫 被限流请求: ${rateLimited.length}`);
  console.log(`❌ 错误请求: ${errors.length}`);
  
  if (rateLimited.length > 0) {
    console.log('\n🚫 被限流的请求详情:');
    rateLimited.forEach((req, index) => {
      console.log(`   ${index + 1}. 请求 #${req.requestId}: ${req.status} - ${req.data?.message || '未知错误'}`);
    });
  }
  
  if (successful.length > 0) {
    console.log('\n✅ 成功的请求示例:');
    const firstSuccess = successful[0];
    console.log(`   请求 #${firstSuccess.requestId}: ${firstSuccess.status} - ${firstSuccess.data?.message || '成功'}`);
    console.log(`   剩余请求次数: ${firstSuccess.headers['X-RateLimit-Remaining'] || '未知'}`);
  }
}

// 主测试函数
async function runRateLimitTest() {
  console.log('🛡️  Express Rate Limit 测试');
  console.log('=' .repeat(50));
  console.log(`📍 测试端点: ${BASE_URL}${TEST_ENDPOINT}`);
  console.log(`🎯 限流配置: 每秒最多 10 次请求`);
  
  try {
    // 测试 1: 发送 8 个请求（应该都成功）
    console.log('\n🧪 测试 1: 发送 8 个请求（应该都成功）');
    const results1 = await sendRequests(8);
    analyzeResults(results1);
    
    // 等待 1 秒
    console.log('\n⏳ 等待 1 秒...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试 2: 发送 15 个请求（前 10 个成功，后 5 个被限流）
    console.log('\n🧪 测试 2: 发送 15 个请求（前 10 个成功，后 5 个被限流）');
    const results2 = await sendRequests(15);
    analyzeResults(results2);
    
    // 等待 2 秒
    console.log('\n⏳ 等待 2 秒让限流重置...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试 3: 再次发送 5 个请求（应该都成功）
    console.log('\n🧪 测试 3: 再次发送 5 个请求（应该都成功）');
    const results3 = await sendRequests(5);
    analyzeResults(results3);
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
runRateLimitTest(); 