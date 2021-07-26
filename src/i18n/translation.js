// 找出项目中所有需要翻译的中文 $spt() 包裹的中文

const fs = require('fs');
const path = require('path');
const SHA256 = require('crypto-js/sha256');
const YAML = require('yamljs');

const ymlData1 = YAML.parse(fs.readFileSync(path.resolve('./src/i18n/translationFile.yml'), 'utf-8')) || {};
/**
 * 	例如 $spt('中文')
 * 	{
 * 		348ea84c60466c775ef76b536818a2148fa706b722e60373969b9291703275d9: {cn: "英文", en: ""}
 *  }
 */

const exitObj = {}; // 用来保存当前文件中存在的翻译key

// 获取对应的翻译文字
function getValue(hash) {
	/** hash
	 * {
		words: [
			881764428,
			1615228023,
			1593273171,
			1746444820,
			-1884879177,
			585499507,
			-1768189295,
			1882355161
		],
		sigBytes: 32
		}
	 */
	const obj1 = ymlData1[hash] || {};

	return {
		enStr: obj1.en || ''
	};
}

function transferFile(filePath) {
	/** filePath
	 * /Users/lichunlin/code/demo/vue-i18n-test/src/views/Home.vue
	 */

	const file = fs.readFileSync(filePath, 'utf-8');

	// 匹配除去'和"的其余所有标点符号
	const reg = /\$spt\((['"])([\u4e00-\u9fa5a-zA-Z0-9\s\,\.\/\;\[\]\\\`\-\=\<\>\?\:\{\}\|\~\!\@\#\$\%\^\&\*\(\)\_\+\，\。\/\；\‘\【\】\、\·\-\=\《\》\？\：\“\”\「\」\|\～\！\@\#\¥\%\…\&\*\（\）\—\+]+)['"]/g;

	let result = reg.exec(file);
	/** result
	 * [
	 * 	"$spt('中文')",
	 * 	“‘”,
	 * 	’中文‘,
	 * 	index: 43,
	 * 	input: '<template>…………'
	 * ]
	 */

	while (result) {
		// 取中文 中文
		const zhCnStr = result[2];
		// 生成哈希值  348ea84c60466c775ef76b536818a2148fa706b722e60373969b9291703275d9
		const hashStr = SHA256(zhCnStr);
		// 获取翻译文字
		const { enStr } = getValue(hashStr);

		if (!exitObj[hashStr]) {
			const obj = {
				enStr,
				zhCnStr
			};
			exitObj[hashStr] = obj;
		} else if (!exitObj[hashStr].enStr) {
			exitObj[hashStr].enStr = enStr;
		}

		result = reg.exec(file);
	}
}

function readDirSync(dirPath) {
	const pa = fs.readdirSync(dirPath);
	pa.forEach((ele) => {
		const currentPath = path.join(dirPath, ele);
		const info = fs.statSync(currentPath);

		// 文件夹则继续递归
		if (info.isDirectory()) {
			readDirSync(currentPath);
		} else if ((ele.endsWith('.vue') || ele.endsWith('.js')) && (ele !== 'translation.js')) {
			// .vue、.js文件
			transferFile(currentPath);
		}
	});
}

function generateFile() {
	// src 目录下进行递归遍历
	readDirSync(path.resolve('./src'));
	console.log('exitObj--->', exitObj);

	let targetStr = '';
	Object.entries(exitObj).forEach(([key, val]) => {
		const { enStr, zhCnStr } = val;
		targetStr += `${key}:\n  cn: "${zhCnStr}"\n  en: "${enStr}"\n`;
	});

	fs.writeFileSync(path.resolve('./src/i18n/translationFile.yml'), targetStr, 'utf-8');
}

generateFile();
