// CSV文件路径
const kwarngHyunCSV = './data/kwarng_hyun.csv';
const zhupHyunCSV = './data/zhup_hyun.csv';
const hwerngSarmCSV = './data/hwerng_sarm.csv';

// 存储解析后的数据
var kwarngHyunData = [];
var zhupHyunData = [];
var hwerngSarmData = [];

// 解析CSV文件的函数，处理包含换行符的单元格
function parseCSV(csvString) {
  var lines = [];
  var currentLine = '';
  var inQuotes = false;
  
  // 处理包含换行符的单元格
  for (var i = 0; i < csvString.length; i++) {
    var char = csvString[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
      continue;
    }
    
    currentLine += char;
  }
  
  // 添加最后一行
  if (currentLine) {
    lines.push(currentLine);
  }
  
  var headers = parseCSVLine(lines[0]);
  var data = [];

  for (var i = 1; i < lines.length; i++) {
    var values = parseCSVLine(lines[i]);
    // 即使列数与表头不同，也处理该行
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    data.push(row);
  }

  return data;
}

// 解析CSV行的函数，处理包含逗号和换行符的单元格
function parseCSVLine(line) {
  var result = [];
  var current = '';
  var inQuotes = false;
  
  for (var i = 0; i < line.length; i++) {
    var char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // 移除单元格两端的引号
      if (current.charAt(0) === '"' && current.charAt(current.length - 1) === '"') {
        current = current.substring(1, current.length - 1);
      }
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // 处理最后一个单元格
  if (current.charAt(0) === '"' && current.charAt(current.length - 1) === '"') {
    current = current.substring(1, current.length - 1);
  }
  result.push(current);
  return result;
}

// 初始化函数，用于加载和解析CSV文件
export function initializeData() {
  return new Promise(function(resolve, reject) {
    // 加载kwarng_hyun.csv
    fetch(kwarngHyunCSV)
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        kwarngHyunData = parseCSV(text);
        // 加载zhup_hyun.csv
        return fetch(zhupHyunCSV);
      })
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        zhupHyunData = parseCSV(text);
        // 加载hwerng_sarm.csv
        return fetch(hwerngSarmCSV);
      })
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        hwerngSarmData = parseCSV(text);
        console.log('CSV文件加载成功');
        resolve();
      })
      .catch(function(error) {
        console.error('加载CSV文件失败:', error);
        reject(error);
      });
  });
}

// 搜索函数
export function searchDictionary(query) {
  if (!query.trim()) {
    return [];
  }

  var results = [];

  // 搜索kwarng_hyun文件：A列作为查询字头，显示D,J,K,Q,R列
  var kwarngResults = kwarngHyunData.filter(function(item) {
    return item['廣韻字頭(覈校後)'] && item['廣韻字頭(覈校後)'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    var qColumn = '廣韻釋義';
    // 直接使用对象的所有值，确保获取最后一列
    var values = Object.values(item);
    return {
      source: '廣韵',
      word: item['廣韻字頭(覈校後)'],
      definition: '<strong>反切</strong>: ' + (item['廣韻反切(覈校後)'] || '') + ' , <strong>聲母</strong>: ' + (item['聲母擬音'] || '') + ' , <strong>韵母</strong>: ' + (item['韻母擬音'] || '') + ' , <strong>聲調</strong>: ' + (item['聲調'] || '') + ' , <strong>釋義</strong>: ' + (item[qColumn] || '') + ' , <strong>補充</strong>: ' + (values[values.length - 1] || '')
    };
  });

  // 搜索zhup_hyun文件：B列作为查询字头，显示D,K,N列
  var zhupResults = zhupHyunData.filter(function(item) {
    return item['字頭'] && item['字頭'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    // 直接使用对象的所有值，确保获取最后一列
    var values = Object.values(item);
    return {
      source: '集韵',
      word: item['字頭'],
      definition: '<strong>反切</strong>: ' + (item['反切'] || '') + ' , <strong>聲母</strong>: ' + (item['聲母擬音'] || '') + ' , <strong>韵母</strong>: ' + (item['韻母擬音'] || '') + ' , <strong>釋義</strong>: ' + (values[values.length - 1] || '')
    };
  });

  // 搜索hwerng_sarm文件：Q列作为查询字头，显示L,N,O,R列
  var hwerngResults = hwerngSarmData.filter(function(item) {
    return item['字頭'] && item['字頭'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    // 直接使用对象的所有值，确保获取最后一列
    var values = Object.values(item);
    return {
      source: '王三',
      word: item['字頭'],
      definition: '<strong>反切</strong>: ' + (item['反切'] || '') + ' , <strong>聲母</strong>: ' + (item['聲母擬音'] || '') + ' , <strong>韵母</strong>: ' + (item['韻母擬音'] || '') + ' , <strong>聲調</strong>: ' + (item['聲調'] || '') + ' , <strong>釋義</strong>: ' + (values[values.length - 1] || '')
    };
  });

  // 合并结果
  results = results.concat(kwarngResults);
  results = results.concat(zhupResults);
  results = results.concat(hwerngResults);

  return results;
}
