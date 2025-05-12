# MWI-Hit-Tracker

银河牛奶放置，攻击线特效插件  
插件地址：https://greasyfork.org/zh-CN/scripts/535422-mwi-hit-tracker-canvas

基于Artintel大佬的油猴脚本，改写为canvas渲染  
原始脚本： https://greasyfork.cc/zh-CN/scripts/535181-mwi-hit-tracker

使用npm进行打包，便于开发

特效编写手册请查阅  
https://docs.qq.com/doc/DS0JjVHp3S09td2NV


## 配置编译环境

安装npm  
随后在项目根目录下执行  

```sh
npm install
```

随后执行

```sh
npm run build
```

即可将插件打包为main.user.js

## 调试特效

先安装anywhere

```sh
npm install -g anywhere
```

随后在项目根目录下执行

```sh
anywhere
```

在浏览器中打开 http://localhost:8000/src/test/test.html  
即可调试特效
