import * as React from 'react';
import { remote } from 'electron';
import { useEffect } from 'react';
import * as path from 'path';

// @ts-ignore
const postscribe = require('postscribe');
const appPath = remote.app.getAppPath();

const NaverSmartEditor: React.FC = () => {
  useEffect(() => {
    const env = remote.process.env.NODE_ENV;
    let HuskyEZCreator;
    let SkinUrl;
    if (env === 'development') {
      HuskyEZCreator = path.resolve('/', 'public', 'NSE2', 'js', 'service', 'HuskyEZCreator.js');
      SkinUrl = path.resolve('/', 'public', 'NSE2', 'SmartEditor2Skin.html');
    } else {
      HuskyEZCreator = path.resolve(
        appPath,
        '..',
        'app.asar.unpacked',
        'dist',
        'public',
        'NSE2',
        'js',
        'service',
        'HuskyEZCreator.js'
      );
      SkinUrl = path.resolve(
        appPath,
        '..',
        'app.asar.unpacked',
        'dist',
        'public',
        'NSE2',
        'SmartEditor2Skin.html'
      );
      const isWin = remote.process.platform === 'win32';
      if (isWin) {
        SkinUrl = SkinUrl.replace(/\\/g, '/');
      }
    }
    postscribe(
      '#loadEditor',
      '<script src="' + HuskyEZCreator + '" charset="utf-8"></script>'
    );
    postscribe(
      '#editor',
      '<div>' +
        '<input id="img-file" type="file" style="font-size: 12px;">' +
        '<span style="font-size: 12px;">사진넓이</span><input id="img-width" type="text" value="740" style="font-size: 12px;">' +
        '<button onclick="(function() {addImg()})()" style="font-size: 12px;">사진추가</button>' +
        '<textarea name="ir1" id="ir1" rows="10" cols="60"/>' +
        '</div>'
    );
    postscribe(
      '#afterEditor',
      '<script type="text/javascript">' +
        'var oEditors = [];nhn.husky.EZCreator.createInIFrame({ oAppRef: oEditors, elPlaceHolder: "ir1", sSkinURI: "' +
        SkinUrl +
        '", fCreator: "createSEditor2"});' +
        'function submitContents(elClickedObj) { oEditors.getById["ir1"].exec("UPDATE_CONTENTS_FIELD", []);};' +
        'function addImg() {' +
        'var imgTag = document.getElementById("img-file");' +
        'var imgFile = imgTag.files[0];' +
        'var widthInput = document.getElementById("img-width");' +
        'var imageWidth = widthInput.value;' +
        'var imageHTML = "<img width=\'" + imageWidth + "\' " + "src=\'" + URL.createObjectURL(imgFile) + "\'/>";' +
        'oEditors.getById["ir1"].exec("PASTE_HTML", [imageHTML]);' +
        '}' +
        '</script>'
    );
  }, []);
  return (
    <>
      <div id={'loadEditor'} />
      <div id={'editor'} />
      <div id={'afterEditor'} />
    </>
  );
};

export default NaverSmartEditor;
