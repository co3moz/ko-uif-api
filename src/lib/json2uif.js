const types = require('./types');

module.exports = function (json) {
  return base(json, 0, true)
}

function base(data, depth, root) {
  if (!data) throw new Error('invalid uif.json. depth: ' + depth);
  if (depth > 10) throw new Error('depth limit is 10, might not valid uif.json file. depth: ' + depth);

  let type = resolveType(data.type);
  let name = buildString(data.name || '');
  let childCount = data.children ? data.children.length : 0;
  let tailCount = data.tail ? data.tail.length : 0;
  if (childCount > 256) throw new Error('max child count is 256, probably not valid uif.json file. depth: ' + depth);
  if (tailCount > 16) throw new Error('max tail count is 16, probably not valid uif.json file. depth: ' + depth);

  let manifest = buildInteger(childCount + (tailCount << 16));
  let children = [];

  for (let i = 0; i < childCount; i++) {
    children.unshift(base(data.children[i], depth + 1, false));
  }

  let id = buildString(data.id || '');
  let position = buildRect({ left: (data.x || 0), top: (data.y || 0), right: (data.width || 0) + (data.x || 0), bottom: (data.height || 0) + (data.y || 0) });
  let movement = buildRect({ left: (data.mov_x || 0), top: (data.mov_y || 0), right: (data.mov_width || 0) + (data.mov_x || 0), bottom: (data.mov_height || 0) + (data.mov_y || 0) });
  let style = buildInteger(data.style | 0);
  let reserved = buildInteger(data.reserved | 0);
  let tooltip = buildString(data.tooltip || '');
  let sndOpen = buildString(data.sndOpen || '');
  let sndClose = buildString(data.sndClose || '');
  let tail = buildBuffer(data.tail || []);

  let extra = Buffer.alloc(0);

  switch (type) {
    case types.IMAGE:
      extra = Buffer.concat([
        buildString(data.texture || ''),
        buildFloatRect(data.crop),
        buildFloat(data.animFrame || 0),
      ]);
      break;
    case types.BUTTON:
      extra = Buffer.concat([
        buildRect({ left: (data.click_x || 0), top: (data.click_y || 0), right: (data.click_width || 0) + (data.click_x || 0), bottom: (data.click_height || 0) + (data.click_y || 0) }),
        buildString(data.sndOn || ''),
        buildString(data.sndClick || '')
      ]);
      break;
    case types.STRING:
      if (data.font) {
        extra = Buffer.concat([
          buildString(data.font || ''),
          buildInteger(data.fontSize || 0),
          buildInteger(data.fontFlags || 0),
          buildBuffer([data.color[2], data.color[1], data.color[0], data.color[3]]),
          buildString(data.text || ''),
          buildInteger(data.unk || 0)
        ]);
      } else {
        extra = Buffer.concat([
          buildString(''),
          buildBuffer([data.color[2], data.color[1], data.color[0], data.color[3]]),
          buildString(obj.text || ''),
          buildInteger(data.unk || 0)
        ]);
      }
      break;
    case types.AREA:
      extra = buildInteger(data.areaType || 0)
      break;
    case types.LIST:
      if (data.font) {
        extra = Buffer.concat([
          buildString(data.font || ''),
          buildInteger(data.fontSize || 0),
          buildBuffer([data.color[2], data.color[1], data.color[0], data.color[3]]),
          buildInteger(data.fontBold || 0),
          buildString(data.fontItalic || ''),
        ]);
      } else {
        extra = buildString('')
      }
      break;
    case types.EDIT:
      extra = Buffer.concat([
        buildString(data.sndClick || ''),
        buildString(data.sndTyping || '')
      ]);
      break;
    case types.FLASH:
      extra = Buffer.concat([
        buildInteger(data.unk || 0),
        buildString(data.file || ''),
        buildFloatRect(data.crop)
      ]);
      break;
    case types.STATIC:
      extra = buildString(data.sndClick || '')
      break;
  }

  return Buffer.concat([
    root ? Buffer.alloc(0) : buildInteger(type),
    name,
    manifest,
    Buffer.concat(children),
    id,
    position,
    movement,
    style,
    reserved,
    tooltip,
    sndOpen,
    sndClose,
    tail,
    extra
  ]);
}

function resolveType(type) {
  switch (type) {
    case 'base': return types.BASE;
    case 'image': return types.IMAGE;
    case 'button': return types.BUTTON;
    case 'string': return types.STRING;
    case 'progress': return types.PROGRESS;
    case 'trackbar': return types.TRACKBAR;
    case 'scrollbar': return types.SCROLLBAR;
    case 'area': return types.AREA;
    case 'list': return types.LIST;
    case 'edit': return types.EDIT;
    case 'flash': return types.FLASH;
    case 'static': return types.STATIC;
    case 'unk15': return types.UNK15;
    case 'unk16': return types.UNK16;
    case 'unk17': return types.UNK17;
    default: throw new Error('invalid uif.json. unknown type! ' + type);
  }
}

function buildInteger(val) {
  let buf = Buffer.allocUnsafe(4);
  buf.writeInt32LE(val);
  return buf;
}

function buildFloat(val) {
  let buf = Buffer.allocUnsafe(4);
  buf.writeFloatLE(val);
  return buf;
}


function buildRect(rect) {
  if (!rect) throw new Error('invalid uif.json. rect expected but found null');

  let buf = Buffer.allocUnsafe(16);

  buf.writeInt32LE(rect.left | 0, 0);
  buf.writeInt32LE(rect.top | 0, 4);
  buf.writeInt32LE(rect.right | 0, 8);
  buf.writeInt32LE(rect.bottom | 0, 12);

  return buf;
}

function buildFloatRect(rect) {
  if (!rect) throw new Error('invalid uif.json. floatRect expected but found null');
  let buf = Buffer.allocUnsafe(16);

  buf.writeFloatLE(rect.left, 0);
  buf.writeFloatLE(rect.top, 4);
  buf.writeFloatLE(rect.right, 8);
  buf.writeFloatLE(rect.bottom, 12);

  return buf;
}

function buildString(str, encoding) {
  let length = str.length;
  if (length > 1024) throw new Error('invalid uif.json. string is longer than 1024 (' + length + '), probably not valid uif file.');
  return Buffer.concat([buildInteger(length), Buffer.from(str, encoding || 'ascii')]);
}

function buildBuffer(array) {
  return Buffer.from(array);
}