// CSV文件路径
const kwarngHyunCSV = './data/kwarng_hyun.csv';
const zhupHyunCSV = './data/zhup_hyun.csv';
const hwerngSarmCSV = './data/hwerng_sarm.csv';
const jierngkorHwerngluikCSV = './data/jierngkor_hwerngluik.csv';
const jierngkorKwarksaaklierngCSV = './data/jierngkor_kwarksaaklierng.csv';
const jierngkorHwarngkharnCSV = './data/jierngkor_hwarngkharn.csv';
const jierngkorToongdhoonghwarCSV = './data/jierngkor_toongdhoonghwar.csv';

// 存储解析后的数据
var kwarngHyunData = [];
var zhupHyunData = [];
var hwerngSarmData = [];
var jierngkorHwerngluikData = [];
var jierngkorKwarksaaklierngData = [];
var jierngkorHwarngkharnData = [];
var jierngkorToongdhoonghwarData = [];

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
        // 加载jierngkor_hwerngluik.csv (上古王力)
        return fetch(jierngkorHwerngluikCSV);
      })
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        jierngkorHwerngluikData = parseCSV(text);
        // 加载jierngkor_kwarksaaklierng.csv (上古郭锡良)
        return fetch(jierngkorKwarksaaklierngCSV);
      })
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        jierngkorKwarksaaklierngData = parseCSV(text);
        // 加载jierngkor_hwarngkharn.csv (上古黃侃)
        return fetch(jierngkorHwarngkharnCSV);
      })
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        jierngkorHwarngkharnData = parseCSV(text);
        // 加载jierngkor_toongdhoonghwar.csv (上古董同龢)
        return fetch(jierngkorToongdhoonghwarCSV);
      })
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        jierngkorToongdhoonghwarData = parseCSV(text);
        console.log('jierngkorToongdhoonghwarData first item:', jierngkorToongdhoonghwarData[0]);
        console.log('jierngkorToongdhoonghwarData keys:', Object.keys(jierngkorToongdhoonghwarData[0] || {}));
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

  var qieyunResults = [];
  var shangguResults = [];

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
      definition: '<strong>反切</strong>: ' + (item['廣韻反切(覈校後)'] || '') + ' , <strong>聲母</strong>: ' + (item['聲母擬音'] || '') + ' , <strong>韵母</strong>: ' + (item['韻母擬音'] || '') + ' , <strong>聲調</strong>: ' + (item['聲調'] || '') + ' , <strong>釋義</strong>: ' + (item[qColumn] || '') + ' , <strong>補充</strong>: ' + (values[values.length - 1] || ''),
      period: 'qieyun'
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
      definition: '<strong>反切</strong>: ' + (item['反切'] || '') + ' , <strong>聲母</strong>: ' + (item['聲母擬音'] || '') + ' , <strong>韵母</strong>: ' + (item['韻母擬音'] || '') + ' , <strong>釋義</strong>: ' + (values[values.length - 1] || ''),
      period: 'qieyun'
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
      definition: '<strong>反切</strong>: ' + (item['反切'] || '') + ' , <strong>聲母</strong>: ' + (item['聲母擬音'] || '') + ' , <strong>韵母</strong>: ' + (item['韻母擬音'] || '') + ' , <strong>聲調</strong>: ' + (item['聲調'] || '') + ' , <strong>釋義</strong>: ' + (values[values.length - 1] || ''),
      period: 'qieyun'
    };
  });

  // 搜索jierngkor_hwerngluik文件 (上古王力)：第一列查询，返回第二列韵部，第三列韵母
  var jierngkorHwerngluikResults = jierngkorHwerngluikData.filter(function(item) {
    return item['字'] && item['字'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    var values = Object.values(item);
    return {
      source: '上古王力',
      word: item['字'],
      definition: '<strong>韻部</strong>: ' + (item['韻部'] || item['韵部'] || values[1] || '') + ' , <strong>韻母</strong>: ' + (item['韻母'] || item['韵母'] || values[2] || ''),
      period: 'shanggu'
    };
  });

  // 搜索jierngkor_kwarksaaklierng文件 (上古郭锡良)
  // CSV列结构：原字頭,字頭,補充,古韻,擬音
  var jierngkorKwarksaaklierngResults = jierngkorKwarksaaklierngData.filter(function(item) {
    return item['字頭'] && item['字頭'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    var bukau = item['補充'] || '';
    var yunbu = item['古韻'] || '';
    var yunmu = item['擬音'] || '';
    return {
      source: '上古郭錫良',
      word: item['字頭'],
      definition: '<strong>補充</strong>: ' + bukau + ' , <strong>韻部</strong>: ' + yunbu + ' , <strong>韻母</strong>: ' + yunmu,
      period: 'shanggu'
    };
  });

  // 搜索jierngkor_hwarngkharn文件 (上古黃侃)：第一列查询，返回第二列韵部，第三列韵母
  var jierngkorHwarngkharnResults = jierngkorHwarngkharnData.filter(function(item) {
    return item['字符'] && item['字符'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    var values = Object.values(item);
    return {
      source: '上古黃侃',
      word: item['字符'],
      definition: '<strong>韻部</strong>: ' + (item['韵部'] || item['韻部'] || values[1] || '') + ' , <strong>韻母</strong>: ' + (item['韵母'] || item['韻母'] || values[2] || ''),
      period: 'shanggu'
    };
  });

  // 搜索jierngkor_toongdhoonghwar文件 (上古董同龢)：第二列查询，返回第三列韻部，第四列韻母
  // CSV列结构：字號,字,韻部,韻母
  var jierngkorToongdhoonghwarResults = jierngkorToongdhoonghwarData.filter(function(item) {
    return item['字'] && item['字'].toLowerCase().includes(query.toLowerCase());
  }).map(function(item, index) {
    var values = Object.values(item);
    console.log('Toongdhoonghwar item:', item);
    console.log('Toongdhoonghwar values:', values);
    var yunbu = item['韻部'] || values[2] || '';
    var yunmu = item['韻母'] || values[3] || '';
    return {
      source: '上古董同龢',
      word: item['字'],
      definition: '<strong>韻部</strong>: ' + yunbu + ' , <strong>韻母</strong>: ' + yunmu,
      period: 'shanggu'
    };
  });

  // 合并切韵结果
  qieyunResults = qieyunResults.concat(kwarngResults);
  qieyunResults = qieyunResults.concat(zhupResults);
  qieyunResults = qieyunResults.concat(hwerngResults);

  // 合并上古音结果
  shangguResults = shangguResults.concat(jierngkorHwerngluikResults);
  shangguResults = shangguResults.concat(jierngkorKwarksaaklierngResults);
  shangguResults = shangguResults.concat(jierngkorHwarngkharnResults);
  shangguResults = shangguResults.concat(jierngkorToongdhoonghwarResults);

  // 返回包含period标记的结果
  return {
    qieyun: qieyunResults,
    shanggu: shangguResults
  };
}