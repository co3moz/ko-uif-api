/* eslint-env browser,jquery */
let view = document.querySelector('#view');
let picked;

$('li.open').on('click', function () {
  $('input[type="file"]').click();
})

$('li.json').on('click', function () {
  $('.jsonDialog textarea').text(JSON.stringify(getJSON(window.data), null, '  '))
  Metro.dialog.open('.jsonDialog');
})

$('li.close').on('click', function () {
  Metro.dialog.open('.closeDialog')
})

$('.discard').on('click', function () {
  window.data = null;
  window.selectedFile = null;

  $('li.open').css({ display: 'block' });
  $('li.file_p').css({ display: 'none' });
  $('span.file_p').text('');
  $('li.save').css({ display: 'none' });
  $('li.json').css({ display: 'none' });
  $('li.close').css({ display: 'none' });
  $('.tree').empty();
  $('#view').empty();
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

    download(await response.blob(), selectedFile.name);

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
    let file = this.files[0];
    let formData = new FormData();
    formData.set('uif', file);

    fetch('/uif2json', {
      method: 'POST',
      body: formData
    }).then(async response => {
      let data = await response.json();

      if (response.ok) {
        return data;
      }

      throw data;
    }).then(data => {
      render(data, file);
    }).catch(err => {
      Metro.toast.create("Error: " + (err ? err.err || err.message : 'Unknown'), null, 5000, "alert");
    })
  }

  $this.val(null);
})

async function render(data, file) {
  window.data = data;
  window.selectedFile = file;

  $('li.open').css({ display: 'none' });
  $('li.file_p').css({ display: 'block' });
  $('span.file_p').text(file.name);
  $('li.save').css({ display: 'block' });
  $('li.json').css({ display: 'block' });
  $('li.close').css({ display: 'block' });

  reverseChild(data);

  let div = await BuildView(data);

  reverseChild(data);

  BuildTree(data);

  reverseChild(data);

  $('.tree').data('treeview').options.onNodeClick = function (item) {
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
          { key: 'mov_x', type: 'number' },
          { key: 'mov_y', type: 'number' },
          { key: 'mov_width', type: 'number' },
          { key: 'mov_height', type: 'number' }
        ]
      },
      {
        category: 'others',
        children: [
          { key: 'style', type: 'number' },
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
          { key: 'texture', type: 'text' },
          { key: 'crop.left', type: 'number' },
          { key: 'crop.top', type: 'number' },
          { key: 'crop.right', type: 'number' },
          { key: 'crop.bottom', type: 'number' },
          { key: 'animFrame', type: 'number' }
        ]
      })
    } else if (uif.type == 'button') {
      cat.push({
        category: uif.type,
        children: [
          { key: 'click_x', type: 'number' },
          { key: 'click_y', type: 'number' },
          { key: 'click_width', type: 'number' },
          { key: 'click_height', type: 'number' },
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
        <div class="cell-5">${pick.caption || pick.key}</div>
        <div class="cell-7">
          <input type="number" class="mt-1" value="${access(uif, pick.key) || '0'}" key="${pick.key}">
        </div>
      </div>`);
        } else if (pick.type == 'text') {
          lrows.push(`<div class="row" style="margin: 0">
        <div class="cell-5">${pick.caption || pick.key}</div>
        <div class="cell-7">
          <input type="text" class="mt-1" value="${access(uif, pick.key) || ''}" ${pick.readonly ? ' readonly' : ''} key="${pick.key}">
        </div>
      </div>`);
        } else if (pick.type == 'color') {
          let color = access(uif, pick.key);
          /* eslint-disable no-undef */
          lrows.push(`<div class="row" style="margin: 0">
        <div class="cell-5">${pick.caption || pick.key}</div>
        <div class="cell-7">
        <input type="color" class="mt-1" value="${Metro.colors.rgb2hex({ r: color[0], g: color[1], b: color[2] })}" key="${pick.key}">
        </div>
        </div>`);
          /* eslint-enable no-undef */
        }
      }

      rows.push(`<div class="frame">
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

    $('.controls').html(`<div data-role="accordion" data-one-frame="false" data-show-active="false">${rows.join('')}</div>`)
    $('.controls').find('input').on('change', function (e) {
      let key = this.getAttribute('key');
      accessAndSet(picked.uif, key, this.value);
      UpdateAll(data);
    });
  }

  view.innerHTML = "";
  view.appendChild(div);
}

function reverseChild(obj) {
  if (obj.children) {
    obj.children.reverse();
    for (let child of obj.children) {
      reverseChild(child);
    }
  }
}

function BuildTree(obj, father) {
  let div = obj.div;
  let name = obj.id || '';
  if (father && father.type == 'button') {
    let index = father.children.findIndex(x => x == obj);
    if (index == 0) {
      name = 'disable';
    } else if (index == 1) {
      name = 'hover';
    } else if (index == 2) {
      name = 'down';
    } else if (index == 3) {
      name = 'normal';
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
      item.children.push(getJSON(child));
    }
  }

  return item;
}

async function UpdateView(obj) {
  let div = obj.div;
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
    div.appendChild(textDiv);
  }

  if (obj.type == 'button') {
    await fillWithImageTexture(div, obj.children[0]);

    div.onmouseenter = () => fillWithImageTexture(div, obj.children[2])
    div.onmouseleave = () => fillWithImageTexture(div, obj.children[0])
    div.onmousedown = () => fillWithImageTexture(div, obj.children[1])
    div.onmouseup = () => fillWithImageTexture(div, obj.children[2])

    return false;
  }

  return true;
}

async function UpdateAll(obj) {
  if (!await UpdateView(obj)) {
    return;
  }

  if (obj.children) {
    for (let child of obj.children) {
      await UpdateAll(child);
    }
  }
}


async function BuildView(obj) {
  let div = document.createElement('div');
  div.uif = obj;
  obj.div = div;

  if (!await UpdateView(obj)) {
    return div;
  }

  if (obj.children) {
    for (let child of obj.children) {
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
  let imgData = await getImage(image.texture);
  if (imgData.noimage) {
    div.style.backgroundImage = 'url(noimage.png)';
    div.style.backgroundSize = undefined;
    div.style.backgroundPositionX = undefined;
    div.style.backgroundPositionY = undefined;
  } else {
    let width = (image.crop.right - image.crop.left) * imgData.width;
    let height = (image.crop.bottom - image.crop.top) * imgData.height;
    let rw = image.width / width;
    let rh = image.height / height;

    div.style.backgroundImage = 'url(/resource/' + image.texture.replace(/\\/g, '/').replace('.dxt', '.png') + ')';
    div.style.backgroundSize = (imgData.width * rw) + 'px ' + (imgData.height * rh) + 'px';
    div.style.backgroundPositionX = '-' + (image.crop.left * imgData.width * rw) + 'px';
    div.style.backgroundPositionY = '-' + (image.crop.top * imgData.height * rh) + 'px';
  }
}

let _imageCache = {};
function getImage(img) {
  img = img.split('.');
  img.pop();
  img = img.join('.') + '.png';

  if (_imageCache[img]) {
    return _imageCache[img];
  }

  return new Promise(resolve => {
    let imgDom = document.createElement('img');
    imgDom.src = img[0] == '/' ? img : '/resource/' + img;
    imgDom.onload = function () {
      _imageCache[img] = imgDom;
      resolve(imgDom);
    };

    imgDom.onerror = async function () {
      let noimage = await getImage('/noimage.png');
      noimage.noimage = true;
      resolve(noimage);
    }
  });
}