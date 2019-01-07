const types = require('./types');

module.exports = function (buffer) {
  let buf = { buffer, offset: 0 };

  let data = base(buf, undefined, 10);

  return toJSON(data);
}

function base(buf, type, depth) {
  if (!depth) throw new Error('depth limit is 10, might not valid uif file. offset: ' + buf.offset)
  let obj = {};
  obj.name = readString(buf);
  let manifest = readInteger(buf);
  let childCount = manifest & 0xFF;
  obj.type = type;
  let tail = manifest >>> 16;
  let children = childCount > 0 ? [] : undefined;

  if (tail > 16) throw new Error('max tail is 16, probably not valid uif file. offset: ' + buf.offset);

  for (let i = 0; i < childCount; i++) {
    let childType = readInteger(buf);
    children.unshift(base(buf, childType, depth - 1));
  }

  obj.id = readString(buf);
  let rect = readRect(buf);
  obj.x = rect.left;
  obj.y = rect.top;
  obj.width = rect.right - rect.left;
  obj.height = rect.bottom - rect.top;
  let movRect = readRect(buf);
  obj.mov_x = movRect.left;
  obj.mov_y = movRect.top;
  obj.mov_width = movRect.right - movRect.left;
  obj.mov_height = movRect.bottom - movRect.top;
  obj.style = readInteger(buf);
  obj.reserved = readInteger(buf);
  obj.tooltip = readString(buf);
  obj.sndOpen = readString(buf);
  obj.sndClose = readString(buf);
  obj.tail = readArray(buf, tail);

  switch (type || 0) {
    case types.BASE:
      obj.type = 'base';
      break;
    case types.IMAGE:
      obj.type = 'image';
      obj.texture = readString(buf);
      obj.crop = readFloatRect(buf);
      obj.animFrame = readFloat(buf);
      break;
    case types.BUTTON: {
      obj.type = 'button';
      let clickRect = readRect(buf);
      obj.click_x = clickRect.left;
      obj.click_y = clickRect.top;
      obj.click_width = clickRect.right - clickRect.left;
      obj.click_height = clickRect.bottom - clickRect.top;
      obj.sndOn = readString(buf);
      obj.sndClick = readString(buf);
      break;
    }
    case types.STRING:
      obj.type = 'string';
      obj.font = readString(buf);
      if (obj.font) {
        obj.fontSize = readInteger(buf);
        obj.fontFlags = readInteger(buf);
      }
      obj.color = readArray(buf, 4);
      obj.text = readString(buf);
      obj.unk = readInteger(buf);

      obj.color = [obj.color[2], obj.color[1], obj.color[0], obj.color[3]]; // rgba
      break;
    case types.PROGRESS:
      obj.type = 'progress';
      break;
    case types.TRACKBAR:
      obj.type = 'trackbar';
      break;
    case types.SCROLLBAR:
      obj.type = 'scrollbar';
      break;

    case types.AREA:
      obj.type = 'area';
      obj.areaType = readInteger(buf);
      break;
    case types.LIST:
      obj.type = 'list';
      obj.font = readString(buf);
      if (obj.font) {
        obj.fontSize = readInteger(buf);
        obj.color = readArray(buf, 4);
        obj.fontBold = readInteger(buf);
        obj.fontItalic = readString(buf);

        obj.color = [obj.color[2], obj.color[1], obj.color[0], obj.color[3]]; // rgba
      }

      break;
    case types.EDIT:
      obj.type = 'edit';
      obj.sndClick = readString(buf);
      obj.sndTyping = readString(buf);
      break;
    case types.FLASH:
      obj.type = 'flash';
      obj.unk = readInteger(buf);
      obj.file = readString(buf);
      obj.crop = readFloatRect(buf);
      break;
    case types.STATIC:
      obj.type = 'static';
      obj.sndClick = readString(buf);
      break;
    case types.UNK15:
      obj.type = 'unk15';
      break;
    case types.UNK16:
      obj.type = 'unk16';
      break;
    case types.UNK17:
      obj.type = 'unk17';
      break;
    default:
      throw new Error('unknown type! type: ' + type + ', probably not valid uif file. offset: ' + buf.offset);
  }

  obj.children = children;

  return obj;
}

function readInteger(buf) {
  let value = buf.buffer.readUInt32LE(buf.offset);
  buf.offset += 4;
  return value;
}

function readFloat(buf) {
  let value = buf.buffer.readFloatLE(buf.offset);
  buf.offset += 4;
  return value;
}

function readShort(buf) {
  let value = buf.buffer.readUInt16LE(buf.offset);
  buf.offset += 2;
  return value;
}

function readRect(buf) {
  let value = { left: buf.buffer.readInt32LE(buf.offset), top: buf.buffer.readInt32LE(buf.offset + 4), right: buf.buffer.readInt32LE(buf.offset + 8), bottom: buf.buffer.readInt32LE(buf.offset + 12) };
  buf.offset += 16;
  return value;
}


function readFloatRect(buf) {
  let value = { left: buf.buffer.readFloatLE(buf.offset), top: buf.buffer.readFloatLE(buf.offset + 4), right: buf.buffer.readFloatLE(buf.offset + 8), bottom: buf.buffer.readFloatLE(buf.offset + 12) };
  buf.offset += 16;
  return value;
}

function readString(buf) {
  let length = readInteger(buf);
  if (length <= 0) return '';
  if (length > 1024) throw new Error('string is longer than 1024 ' + length + ', probably not valid uif file. offset: ' + buf.offset);
  let offset = buf.offset;
  buf.offset += length;
  return buf.buffer.slice(offset, offset + length).toString('ascii');
}

function readBuffer(buf, length) {
  let offset = buf.offset;
  buf.offset += length;
  return buf.buffer.slice(offset, offset + length);
}

function readArray(fd, length) {
  return Array.from(readBuffer(fd, length))
}

function toJSON(data) {
  pruneEmptyOnes(data);
  return data;
}

function pruneEmptyOnes(data) {
  if (!data) return;

  for (let key of Object.keys(data)) {
    if (data[key] == null || data[key] == '') {
      delete data[key];
    }
  }

  if (data.children) {
    for (let child of data.children) {
      pruneEmptyOnes(child);
    }
  }
}
