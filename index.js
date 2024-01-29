#! /usr/bin/node

const fs = require('fs').promises;
const sharp = require('sharp');
const jimp = require('jimp');
const ico = require('icojs');
const path = require('path');


// 获取命令行参数
const inputImagePath = process.argv[2];

// 获取输入文件的基本名称和扩展名
const inputFileName = path.basename(inputImagePath, path.extname(inputImagePath));

// 构建输出 ICO 文件路径
const outputIcoPath = path.join(path.dirname(inputImagePath), `${inputFileName}.ico`);

// 检查输入文件是否存在
async function checkFileExists() {
  try {
    await fs.access(inputImagePath);
    return true;
  } catch (error) {
    console.error('Error: Input file does not exist');
    return false;
  }
}

// 转换图像为 ICO
async function convertToIco() {
  try {
    const fileExists = await checkFileExists();

    if (!fileExists) {
      return;
    }

    // 读取输入图像
    const imageBuffer = await fs.readFile(inputImagePath);

    // 将 PNG、WebP 或 JPG 转换为 Buffer
    const { data, info } = await sharp(imageBuffer).toBuffer({ resolveWithObject: true });

    // 处理 PNG 格式
    if (info.format === 'png') {
      const pngImage = await jimp.read(data);
      const pngBuffer = await pngImage.getBufferAsync(jimp.MIME_PNG);
      ico.fromBuffer([pngBuffer], (err, buf) => {
        if (err) {
          console.error('Error creating ICO:', err);
        } else {
          fs.writeFile(outputIcoPath, buf);
          console.log('ICO file created successfully:', outputIcoPath);
        }
      });
    } else {
      // 其他格式直接使用 sharp 转换
      ico.fromBuffer([data], (err, buf) => {
        if (err) {
          console.error('Error creating ICO:', err);
        } else {
          fs.writeFile(outputIcoPath, buf);
          console.log('ICO file created successfully:', outputIcoPath);
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// 执行转换
convertToIco();

