/* eslint-env browser,jquery */
let view = document.querySelector('#view');
let picked;
let changed = false;
let lock = false;
let resourceObj = {};
let resourceBlob = {};

let r = localStorage.getItem('resources');

if (r) {
  try {
    resourceObj = JSON.parse(r);

    for (let key in resourceObj) {
      resourceBlob[key] = generateBlobUrl(localStorage.getItem(resourceObj[key]));
      console.log('resource %s loaded', key);
    }
  } catch (e) {

  }
}

$('li.open').on('click', function () {
  $('input[type="file"]').click();
})

$('li.json').on('click', function () {
  $('.jsonDialog textarea').text(JSON.stringify(getJSON(window.data), null, '  '))
  Metro.dialog.open('.jsonDialog');
})

$('li.resources').on('click', function () {
  if (!$('.window').length) {
    let body = Object.keys(resourceObj).map(key => `<div class="row m-0">
    <div class="cell-5">
      ${key}
    </div>
    <div class="cell-5">
      <img src="${resourceBlob[key]}" alt="${key}" style="height: 64px; width: 64px;"/>
    </div>

    <div class="cell-2">
      <button class="button alert w-100 resource_remove" resource="${key}">Remove</button>
    </div>
  </div>`).join('');

    Metro.window.create({
      draggable: true,
      width: 700,
      height: 400,
      icon: '<span class="mif-books"></span>',
      title: 'Resources',
      btnMin: false,
      btnMax: false,
      closeAction: Metro.actions.REMOVE,
      resizable: false,
      place: 'center',
      content: `<div class="p-2">
      <div class="row m-0">
        <div class="cell-5">
          <input class="resource_path" type="text" data-role="input" data-clear-button="false" placeholder="ui\\custom_file_location.dxt">
        </div>
        <div class="cell-5">
          <input class="resource_file" type="file" accept="image/*" data-role="file" placeholder="file" data-button-title="<span class='mif-folder'></span>">
        </div>

        <div class="cell-2">
          <button class="button primary w-100 resource_add">Add</button>
        </div>
      </div>
      <hr/>

      <div class="resource_list">
      ${body}
      </div>

    </div>`
    });

    $('.window').on('click', '.resource_remove', e => {
      let $e = $(e.currentTarget);
      let resource = $e.attr('resource');
      let key = resourceObj[resource];

      delete resourceObj[resource];
      delete resourceBlob[resource];

      localStorage.setItem('resources', JSON.stringify(resourceObj));
      localStorage.removeItem(key);

      $e.parents('.row').remove();
      if (window.data) {
        UpdateAll(data);
      }
    });

    $('.window').on('click', '.resource_add', async e => {
      if (lock) return;
      lock = true;

      $('.resource_add').attr('disabled', true);

      try {
        let $path = $('.resource_path input');
        let $file = $('.resource_file input');

        let path = $path.val();
        if (!path) {
          throw new Error('Path is required. (eg: ui\\re_some_icon.dxt)');
        }

        if (!$file.val()) {
          throw new Error('File is required. (pick some image)');
        }

        if (resourceObj[path]) {
          throw new Error('This path is already used in another resource path');
        }

        let dataUrl = await generateDataUrl($file[0]);

        await checkDimensions(dataUrl);

        let name = Date.now();
        resourceObj[path] = name;
        localStorage.setItem('resources', JSON.stringify(resourceObj));
        localStorage.setItem(name, dataUrl);

        let blobURL = generateBlobUrl(dataUrl)

        resourceBlob[path] = blobURL;

        if (window.data) {
          await UpdateAll(data);
        }

        $('.resource_list').append(`<div class="row m-0">
        <div class="cell-5">
          ${path}
        </div>
        <div class="cell-5">
          <img src="${blobURL}" alt="${path}" style="width: 64px;"/>
        </div>
    
        <div class="cell-2">
          <button class="button alert w-100 resource_remove" resource="${path}">Remove</button>
        </div>
      </div>`)

        $path.val('');
        $file.val('');
        $file.parent().find('span.caption').text('');
      } catch (e) {
        Metro.toast.create("Error: " + e.message, null, 1000, "alert");
      } finally {
        $('.resource_add').attr('disabled', false);
        lock = false;
      }
    });
  }
})


$('li.new').on('click', function () {
  let _new = {
    type: "base",
    height: 559,
    width: 439,
    mov_x: 32,
    mov_y: 12,
    mov_width: 351,
    mov_height: 33,
    tail: [],
    children: [
      { "type": "string", "id": "str_name", "x": 135, "y": 27, "width": 169, "height": 20, "style": 344981504, "tail": [1, 0, 0], "font": "1<82", "fontSize": 10, "fontFlags": 1, "color": [237, 234, 114, 255], "text": "Custom UIF" },
      {
        "type": "button", "id": "btn_close", "x": 384, "y": 12, "width": 34, "height": 33, "style": 65536, "tail": [1, 0, 0], "click_x": 384, "click_y": 12, "click_width": 34, "click_height": 33, "children": [
          { "type": "image", "x": 384, "y": 12, "width": 34, "height": 33, "reserved": 3, "tail": [1, 0, 0], "texture": "ui\\re_page_state.dxt", "crop": { "left": 0.728515625, "top": 0.791015625, "right": 0.794921875, "bottom": 0.85546875 }, "animFrame": 30 },
          { "type": "image", "x": 384, "y": 12, "width": 34, "height": 33, "reserved": 2, "tail": [1, 0, 0], "texture": "ui\\re_page_state.dxt", "crop": { "left": 0.591796875, "top": 0.791015625, "right": 0.658203125, "bottom": 0.85546875 }, "animFrame": 30 },
          { "type": "image", "x": 384, "y": 12, "width": 34, "height": 33, "reserved": 1, "tail": [1, 0, 0], "texture": "ui\\re_page_state.dxt", "crop": { "left": 0.66015625, "top": 0.791015625, "right": 0.7265625, "bottom": 0.85546875 }, "animFrame": 30 },
          { "type": "image", "x": 384, "y": 12, "width": 34, "height": 33, "tail": [1, 0, 0], "texture": "ui\\re_page_state.dxt", "crop": { "left": 0.5234375, "top": 0.791015625, "right": 0.58984375, "bottom": 0.85546875 }, "animFrame": 30 }
        ]
      },
      { "type": "image", "y": 480, "width": 426, "height": 77, "tail": [1, 0, 0], "texture": "ui\\re_auto_02.dxt", "crop": { "left": 0.00390625, "top": 0.3203125, "right": 0.8359375, "bottom": 0.470703125 }, "animFrame": 30 },
      { "type": "image", "x": 3, "width": 421, "height": 481, "tail": [1, 0, 0], "texture": "ui\\re_auto_01.dxt", "crop": { "left": 0.0078125, "top": 0.009765625, "right": 0.830078125, "bottom": 0.94921875 }, "animFrame": 30 }
    ]
  };


  render(_new, 'custom.' + Date.now() + '.uif');

  loading(100);
})

$('li.close').on('click', function () {
  if (changed) {
    Metro.dialog.open('.closeDialog');
  } else {
    window.data = null;
    window.selectedFile = null;

    $('li.new').css({ display: 'block' });
    $('li.open').css({ display: 'block' });
    $('li.file_p').css({ display: 'none' });
    $('span.file_p').text('');
    $('li.save').css({ display: 'none' });
    $('li.json').css({ display: 'none' });
    $('li.close').css({ display: 'none' });
    $('.tree').empty();
    $('#view').empty();
    $('.controls').empty();

    // localStorage.removeItem('data');
    // localStorage.removeItem('selectedItem');
  }
})

$('.discard').on('click', function () {
  window.data = null;
  window.selectedFile = null;

  $('li.new').css({ display: 'block' });
  $('li.open').css({ display: 'block' });
  $('li.file_p').css({ display: 'none' });
  $('span.file_p').text('');
  $('li.save').css({ display: 'none' });
  $('li.json').css({ display: 'none' });
  $('li.close').css({ display: 'none' });
  $('.tree').empty();
  $('#view').empty();
  $('.controls').empty();
  changed = false;

  // localStorage.removeItem('data');
  // localStorage.removeItem('selectedItem');
})

$('li.save').on('click', function () {
  let json = JSON.stringify(getJSON(window.data));

  fetch('/json2uif', {
    method: 'POST',
    body: json,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async response => {
    if (!response.ok) {
      throw data;
    }

    download(await response.blob(), selectedFile);

  }).catch(err => {
    Metro.toast.create("Error: " + (err ? err.err || err.message : 'Unknown'), null, 5000, "alert");
  })
})

function download(blob, filename) {
  var a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

$('input[type="file"]').on('change', function () {
  let $this = $(this);

  if (this.files[0]) {
    loading(0, 'uploading..');

    let file = this.files[0];
    let formData = new FormData();
    formData.append('uif', file);

    fetch('/uif2json', {
      method: 'POST',
      body: formData
    }).then(async response => {
      loading(5, 'parsing..');
      let data = await response.json();

      if (response.ok) {
        return data;
      }

      throw data;
    }).then(data => {
      render(data, file.name);

      loading(100);
    }).catch(err => {
      Metro.toast.create("Error: " + (err ? err.err || err.message : 'Unknown'), null, 5000, "alert");
      loading(100);
    })
  }

  $this.val(null);
})

async function render(data, file) {
  window.data = data;
  window.selectedFile = file;
  // localStorage.setItem('data', JSON.stringify(data));
  // localStorage.setItem('selectedFile', selectedFile);

  $('li.open').css({ display: 'none' });
  $('li.new').css({ display: 'none' });
  $('li.file_p').css({ display: 'block' });
  $('span.file_p').text(file);
  $('li.save').css({ display: 'block' });
  $('li.json').css({ display: 'block' });
  $('li.close').css({ display: 'block' });
  window.total = count(data);
  window.loaded = 0;

  reverseChild(data);

  let div = await BuildView(data);

  reverseChild(data);

  BuildTree(data);

  reverseChild(data);

  loading(95, 'steady..');

  $('.tree').data('treeview').options.onNodeClick = treeClick;

  view.innerHTML = "";
  view.appendChild(div);

  loading(100);
}

function treeClick(item) {
  picked = item.children('.caption')[0];
  if (!picked || !picked.uif) {
    return;
  }

  $('[uif]').removeClass('picked');
  if (picked.div) {
    $(picked.div).addClass('picked');
  } else {
    let s = picked.father;
    while (s) {
      if (s.div) {
        $(s.div).addClass('picked');
        break;
      }

      s = s.father;
    }
  }

  let uif = picked.uif;
  let rows = [];

  let cat = [
    {
      category: 'basics',
      children: [
        { key: 'type', type: 'text', readonly: true },
        { key: 'name', type: 'text' },
        { key: 'id', type: 'text' },
      ]
    },
    {
      category: 'position',
      children: [
        { key: 'x', type: 'number' },
        { key: 'y', type: 'number' },
        { key: 'width', type: 'number' },
        { key: 'height', type: 'number' },
        { key: 'mov_x', type: 'number', caption: 'movable x' },
        { key: 'mov_y', type: 'number', caption: 'movable y' },
        { key: 'mov_width', type: 'number', caption: 'movable width' },
        { key: 'mov_height', type: 'number', caption: 'movable height' }
      ]
    },
    {
      category: 'others',
      children: [
        { key: 'style', type: 'number', caption: 'raw style' },
        { key: 'reserved', type: 'number' },
        { key: 'tooltip', type: 'text' },
        { key: 'sndOpen', type: 'text', caption: 'sound open' },
        { key: 'sndClose', type: 'text', caption: 'sound close' }
      ]
    }
  ];

  if (uif.type == 'image') {
    cat.push({
      category: uif.type,
      children: [
        { key: 'texture', type: 'text', caption: 'texture file' },
        { key: 'crop.left', type: 'number', caption: 'crop left' },
        { key: 'crop.top', type: 'number', caption: 'crop top' },
        { key: 'crop.right', type: 'number', caption: 'crop right' },
        { key: 'crop.bottom', type: 'number', caption: 'crop bottom' },
        { key: 'animFrame', type: 'number' }
      ]
    })
  } else if (uif.type == 'button') {
    cat.push({
      category: uif.type,
      children: [
        { key: 'click_x', type: 'number', caption: 'click x' },
        { key: 'click_y', type: 'number', caption: 'click y' },
        { key: 'click_width', type: 'number', caption: 'click width' },
        { key: 'click_height', type: 'number', caption: 'click height' },
        { key: 'sndOn', type: 'text', caption: 'sound hover' },
        { key: 'sndClick', type: 'text', caption: 'sound click' }
      ]
    })
  } else if (uif.type == 'string') {
    cat.push({
      category: uif.type,
      children: [
        { key: 'text', type: 'text' },
        { key: 'font', type: 'text' },
        { key: 'fontSize', type: 'number' },
        { key: 'fontFlags', type: 'number' },
        { key: 'color', type: 'color' }
      ]
    })
  } else if (uif.type == 'area') {
    cat.push({
      category: uif.type,
      children: [
        { key: 'areaType', type: 'number' },
      ]
    })
  }

  for (let p of cat) {
    let lrows = [];

    for (let pick of p.children) {
      if (pick.type == 'number') {
        lrows.push(`<div class="row" style="margin: 0">
      <div class="cell-5" style="line-height: 40px">${pick.caption || pick.key}</div>
      <div class="cell-7">
        <input type="number" class="mt-1" value="${access(uif, pick.key) || '0'}" key="${pick.key}">
      </div>
    </div>`);
      } else if (pick.type == 'text') {
        lrows.push(`<div class="row" style="margin: 0">
      <div class="cell-5" style="line-height: 40px">${pick.caption || pick.key}</div>
      <div class="cell-7">
        <input type="text" class="mt-1" value="${access(uif, pick.key) || ''}" ${pick.readonly ? ' readonly' : ''} key="${pick.key}">
      </div>
    </div>`);
      } else if (pick.type == 'color') {
        let color = access(uif, pick.key);
        /* eslint-disable no-undef */
        lrows.push(`<div class="row" style="margin: 0">
      <div class="cell-5" style="line-height: 40px">${pick.caption || pick.key}</div>
      <div class="cell-7">
      <input type="color" class="mt-1" value="${Metro.colors.rgb2hex({ r: color[0], g: color[1], b: color[2] })}" key="${pick.key}">
      </div>
      </div>`);
        /* eslint-enable no-undef */
      }
    }

    rows.push(`<div class="frame active">
      <div class="heading">${p.category}</div>
      <div class="content">
        <div class="p-2">
          <div class="grid">
            ${lrows.join('')}
          </div>
        </div>
      </div>
    </div>`)
  }

  $('.controls').html(`<div data-one-frame="false" data-show-active="false" data-duration="0">${rows.join('')}</div>`)
  $('.controls').find('input').on('change', function (e) {
    let type = this.getAttribute('type');
    let key = this.getAttribute('key');

    if (type == 'color') {
      let data = $(this).spectrum('get').toRgb();
      accessAndSet(picked.uif, key, [data.r, data.g, data.b, data.a * 255 >> 0]);
    } else {
      accessAndSet(picked.uif, key, this.value);
    }

    UpdateAll(data);
    changed = true;
    // localStorage.setItem('changed', 'true');
    // localStorage.setItem('data', JSON.stringify(getJSON(data)));
  });

  $('.controls').find('>div').accordion()
  $('.controls').find('>div').data('accordion')._openAll();


  $('input[type="color"]').spectrum({
    preferredFormat: 'rgb',
    showAlpha: true,
    chooseText: 'pick'
  });
}

function reverseChild(obj) {
  if (obj.children) {
    obj.children.reverse();
    for (let child of obj.children) {
      reverseChild(child);
    }
  }
}

function count(obj) {
  let n = 1;
  if (obj.children) {
    for (let child of obj.children) {
      n += count(child);
    }
  }
  return n;
}

function BuildTree(obj, father) {
  let div = obj.div;
  let name = obj.id || '';
  if (father && father.type == 'button') {
    if (obj.type == 'image') {
      let index = obj.reserved || 0;
      if (index == 3) {
        name = 'disable';
      } else if (index == 2) {
        name = 'hover';
      } else if (index == 1) {
        name = 'down';
      } else if (index == 0) {
        name = 'normal';
      }
    }
  }

  let checkBox;

  if (div) {
    checkBox = $('<input tree checked data-role=checkbox><span class="caption"><span class="sub">' + obj.type + '</span>' + (name ? ' ' + name : '') + '</span>')
    checkBox[1]._name = name;
    checkBox[1].uif = obj;
    checkBox[1].div = div;
    checkBox[1].father = father;
    checkBox[0].div = div;

    checkBox.on('change', function () {
      $('[tree]').map((i, e) => {
        let $e = $(e);
        if (e.div) {
          let checked = $e.is(':checked') || ($e.attr('data-indeterminate') == 'true');
          e.div.style.visibility = checked ? '' : 'hidden';
        }
      });
    });

    checkBox.on('mouseover', function () {
      $('[uif]').removeClass('hover');
      $(div).addClass('hover');
    });

    checkBox.on('mouseleave', function () {
      $('[uif]').removeClass('hover');
    });


  } else {
    checkBox = $('<span class="caption"><span class="sub">' + obj.type + '</span>' + (name ? ' ' + name : '') + '</span>')
    checkBox[0]._name = name;
    checkBox[0].uif = obj;
    checkBox[0].father = father;
  }


  if (father) {
    obj.tree = $('.tree').data('treeview').addTo(father.tree, {
      html: checkBox
    });

  } else {
    obj.tree = $('.tree').data('treeview').addTo(null, {
      html: checkBox
    });
  }

  if (obj.children) {
    for (let child of obj.children) {
      BuildTree(child, obj);
    }
  }

  if (obj.div) {
    obj.div.onclick = function (e) {
      e.stopPropagation();
      if (obj.tree) {
        let items = obj.tree.parents('li');

        $('.tree').find('.expanded').each((i, o) => {
          if (!items.find(n => n == o)) {
            $(o).removeClass('expanded').children('ul').hide();
          }
        })

        items.each((i, o) => {
          $(o).addClass('expanded').children('ul').show();
        })

        obj.tree.find('>span.caption').click();

        $('.half').scrollTop(0).scrollTop(obj.tree.offset().top - $('.half').height() / 2);
      }
    }
  }
  $('.tree').data('treeview').toggleNode(obj.tree);
}

function getJSON(obj) {
  let item = {};
  for (let key of Object.keys(obj)) {
    if (key == 'tree') continue;
    if (key == 'div') continue;
    if (key == 'father') continue;
    if (key == 'children') continue;

    item[key] = obj[key];
  }

  if (obj.children) {
    item.children = [];
    for (let child of obj.children) {
      item.children.unshift(getJSON(child));
    }
  }

  return item;
}

async function UpdateView(obj) {
  let div = obj.div;

  // div.setAttribute('data-role', 'hint');
  // div.setAttribute('data-hint-position', 'bottom');
  // div.setAttribute('data-hint-text', obj.type + (obj.id ? ' (' + obj.id + ')' : ''));
  div.title = (obj.type + (obj.id ? ' (' + obj.id + ')' : ''));
  // div.setAttribute('data-cls-hint', 'bg-cyan fg-white drop-shadow');


  div.style.width = obj.width + 'px';
  div.style.height = obj.height + 'px';

  let absolute = absoluteCalculate(obj);
  div.style.left = absolute.x + 'px';
  div.style.top = absolute.y + 'px';

  if (obj.father) {
    div.style.position = 'absolute';
    div.style.left = (obj.father.left - obj.left) + 'px';
    div.style.top = (obj.father.top - obj.top) + 'px';
  }

  div.setAttribute('uif', '');
  div.setAttribute('uif_type', obj.type);

  if (obj.id) {
    div.setAttribute('uif_id', obj.id);
  }

  if (obj.type == 'image') {
    await fillWithImageTexture(div, obj);
  }

  if (obj.type == 'string') {
    div.style.color = `rgba(${obj.color[0]}, ${obj.color[1]}, ${obj.color[2]}, ${obj.color[3] / 255})`;
    div.style.fontFamily = obj.font;
    div.style.fontSize = obj.fontSize + 'px';
    div.style.display = 'table';

    let line = (obj.style & 0x00100000) ? 'single' : 'multiple';
    let horizontal_align = (obj.style & 0x00200000) ? 'left' : (obj.style & 0x00400000) ? 'right' : (obj.style & 0x00800000) ? 'center' : undefined;
    let vertical_align = (obj.style & 0x01000000) ? 'top' : (obj.style & 0x02000000) ? 'bottom' : (obj.style & 0x04000000) ? 'middle' : undefined;

    div.style.textAlign = horizontal_align;

    div.innerHTML = "";
    let textDiv = document.createElement('div');
    textDiv.innerText = obj.text || '';
    textDiv.style.display = 'table-cell';
    textDiv.style.verticalAlign = vertical_align;
    textDiv.style.wordBreak = 'break-word';
    div.appendChild(textDiv);
  }

  if (obj.type == 'button') {
    let images = obj.children.filter(x => x.type == 'image');
    let normal = images.find(x => x.reserved == 0 || x.reserved == undefined);
    let down = images.find(x => x.reserved == 1);
    let up = images.find(x => x.reserved == 2);
    let disable = images.find(x => x.reserved == 3);

    await fillWithImageTexture(div, normal);

    div.onmouseenter = () => fillWithImageTexture(div, up)
    div.onmouseleave = () => fillWithImageTexture(div, normal)
    div.onmousedown = (e) => fillWithImageTexture(div, e.shiftKey ? disable : down)
    div.onmouseup = () => fillWithImageTexture(div, up)
  }
}

async function UpdateAll(obj) {
  if (obj.div) {
    await UpdateView(obj);
  }

  if (obj.children) {
    for (let child of obj.children) {
      await UpdateAll(child);
    }
  }
}

function IncChild(obj) {
  if (obj.children) {
    let children = obj.children;

    for (let child of children) {
      window.loaded++;
      IncChild(child);
    }
  }
}

async function BuildView(obj) {
  let div = document.createElement('div');
  div.uif = obj;
  obj.div = div;
  window.loaded++;
  loading(window.loaded / window.total * 89 + 5);

  await new Promise(resolve => setTimeout(resolve, 5));

  await UpdateView(obj);

  if (obj.children) {
    let children = obj.children;

    if (obj.type == 'button') {
      children.filter(x => x.type == 'image').map(x => IncChild(x));
      children = children.filter(x => x.type != 'image');
    }

    for (let child of children) {
      child.father = obj;
      let childDom = await BuildView(child);
      if (childDom) {
        div.appendChild(childDom);
      }
    }
  }

  return div;
}

function absoluteCalculate(obj) {
  let x = obj.x || 0;
  let y = obj.y || 0;


  // eslint-disable-next-line no-constant-condition
  while (true) {
    obj = obj.father;
    if (!obj) break;
    if (!obj.father) break;

    x += (obj.father.x || 0) - (obj.x || 0);
    y += (obj.father.y || 0) - (obj.y || 0);
  }

  return { x, y };
}

function access(obj, key) {
  key = key.split('.');

  for (let k of key) {
    if (obj == null) return null;
    obj = obj[k];
  }
  return obj;
}

function accessAndSet(obj, key, value) {
  key = key.split('.');
  let setKey = key.pop();

  for (let k of key) {
    if (obj == null) return null;
    obj = obj[k];
  }

  return obj[setKey] = value;
}

async function fillWithImageTexture(div, image) {
  if (!image) {
    div.style.backgroundImage = 'url(noimage.png)';
    div.style.backgroundSize = undefined;
    div.style.backgroundPositionX = undefined;
    div.style.backgroundPositionY = undefined;
    return;
  }

  loading(undefined, image.texture);
  let imgData = await getImage(image.texture);
  div.style.opacity = 1;

  if (imgData.noimage) {
    div.style.backgroundImage = 'url(noimage.png)';
    div.style.backgroundSize = undefined;
    div.style.backgroundPositionX = undefined;
    div.style.backgroundPositionY = undefined;
    if (imgData.blank) {
      div.style.opacity = 0.2;
    }
  } else {
    let width = (image.crop.right - image.crop.left) * imgData.image.width;
    let height = (image.crop.bottom - image.crop.top) * imgData.image.height;
    let rw = image.width / width;
    let rh = image.height / height;

    if (resourceBlob[image.texture]) {
      div.style.backgroundImage = 'url("' + resourceBlob[image.texture] + '")';
    } else {
      div.style.backgroundImage = 'url("https://uif.knightby.com/resource/' + image.texture.replace(/\\/g, '/').replace('.dxt', '.png') + '")';
    }

    div.style.backgroundSize = (imgData.image.width * rw) + 'px ' + (imgData.image.height * rh) + 'px';
    div.style.backgroundPositionX = '-' + (image.crop.left * imgData.image.width * rw) + 'px';
    div.style.backgroundPositionY = '-' + (image.crop.top * imgData.image.height * rh) + 'px';
    div.style.imageRendering = 'pixelated';
  }
}

let _imageCache = {};
function getImage(img) {
  if (!img) {
    return new Promise(async resolve => {
      let noimage = await getImage('/noimage.png');
      resolve({ noimage: true, blank: true, image: noimage });
    });
  }

  if (resourceBlob[img]) {
    return new Promise(resolve => {
      let imgDom = document.createElement('img');
      imgDom.src = resourceBlob[img];
      imgDom.onload = function () {
        resolve({ image: imgDom });
      };
    });
  }

  img = img.split('.');
  img.pop();
  img = img.join('.') + '.png';

  if (_imageCache[img]) {
    return _imageCache[img];
  }

  return new Promise(resolve => {
    let imgDom = document.createElement('img');
    imgDom.src = img[0] == '/' ? img : 'https://uif.knightby.com/resource/' + img;
    imgDom.onload = function () {
      _imageCache[img] = { image: imgDom };
      resolve({ image: imgDom });
    };

    imgDom.onerror = async function () {
      Metro.toast.create("Missing texture: " + img, null, 5000, "warning");
      let noimage = await getImage('/noimage.png');
      _imageCache[img] = { noimage: true, blank: false, image: noimage.image };
      resolve({ noimage: true, blank: false, image: noimage });
    }
  });
}

let $wrapper = $('._wrapper');
let $loading = $('._loading');
let $loadingText = $loading.find('._text');
let $loadingProgress = $loading.find('._progress');
let $loadingState = $loading.find('._state');

function loading(percent, lastState) {
  if (lastState != undefined) {
    $loadingState.text(lastState ? lastState : 'loading..');
  }

  if (percent != undefined) {
    if (percent < 100) {
      $loadingProgress.css({ width: percent + '%' });
      $loadingText.text((parseInt(percent * 10) / 10) + '%');

      $wrapper.css({ display: 'block' });
      $loading.css({ display: 'block' });
    } else {
      $wrapper.css({ display: 'none' });
      $loading.css({ display: 'none' });
    }
  }
}



// setTimeout(function () {
//   let data = localStorage.getItem('data');
//   let selectedFile = localStorage.getItem('selectedFile');

//   if (data) {
//     render(JSON.parse(data), selectedFile);
//   }

// }, 50);

function generateDataUrl(input) {
  return new Promise(resolve => {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        resolve(e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    }
  });
}

function checkDimensions(url) {
  return new Promise((resolve, reject) => {
    let img = document.createElement('img');
    img.src = url;
    img.style.display = 'none';
    let valid = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

    img.onload = function () {
      if (!valid.some(x => x == img.width)) {
        return reject(new Error('Image width resolution should be power of 2! (eg: 32, 64, 128, 256, 512)'));
      }
      if (!valid.some(x => x == img.height)) {
        return reject(new Error('Image height resolution should be power of 2! (eg: 32, 64, 128, 256, 512)'));
      }

      resolve();
    }

    img.onerror = function () {
      reject(new Error('Invalid image'));
    }
  });
}

function generateBlobUrl(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return URL.createObjectURL(new Blob([u8arr], { type: mime }));
}

setTimeout(function () {
  loading(100, '');
}, 50);