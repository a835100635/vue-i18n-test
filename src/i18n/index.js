
import Vue from 'vue';
import VueI18n from "vue-i18n";
import SHA256 from 'crypto-js/sha256';

Vue.use(VueI18n);

const translationData = require("json-loader!yaml-loader!./translationFile.yml") || {};
console.log('translationData-->', translationData);

// 格式化
function getYmlData() {
  const enObj = {};
  const cnObj = {};

  Object.entries(translationData).forEach(([key, val]) => {
    const enStr = val.en;
    const cnStr = val.zh;
    enObj[key] = enStr || "";
    cnObj[key] = cnStr || "";
  });

  return {
    enObj,
    cnObj,
  };
}

const { enObj, cnObj } = getYmlData();

const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    zh: cnObj, // 中文语言包
    en: enObj, // 英文语言包
  },
});

// 在原来函数的基础上做一层封装，如果没有翻译默认返回中文
Vue.prototype.$spt = i18n.$spt = (str, ...arg) => {
    console.log(str, ...arg);
  const val = i18n.t(SHA256(str), ...arg);
  return val || str;
};

export default i18n;