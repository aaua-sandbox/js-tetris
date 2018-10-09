var COLS = 10, ROWS = 20; // 横10, 縦20マス
var board = []; // 盤面情報
var lose; // 一番上まで到達したか
var interval; // ゲームを実行するタイマーを保持する変数
var current; // 今操作しているブロックの形
var currentX, currentY; // 今操作しているブロックの位置

// 操作するブロックのパターン
var shapes = [
  [ 1, 1, 1, 1 ],
  [ 1, 1, 1, 0,
    1 ],
  [ 1, 1, 1, 0,
    0, 0, 1 ],
  [ 1, 1, 0, 0,
    1, 1 ],
  [ 1, 1, 0, 0,
    0, 1, 1 ],
  [ 0, 1, 1, 0,
    1, 1 ],
  [ 0, 1, 0, 0,
    1, 1, 1 ]
];

// ブロックの色
var colors = [
  'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

// 盤面の初期化
function init() {
  for (var y=0; y < ROWS; ++y) {
    board[y] = [];
    for (var x=0; x < COLS; ++x) {
      board[y][x] = 0;
    }
  }
}

// shapesからランダムにブロックのパターンを出力し、盤面の一番上へセットする
function newShape() {
  var id = Math.floor(Math.random() * shapes.length);
  var shape = shapes[id];

  // パターンを操作ブロックへセット
  current = [];
  for (var y = 0; y < 4; ++y) {
    current[y] = [];
    for (var x = 0; x < 4; ++x) {
      var i = 4 * y + x;
      if (typeof shape[i] != 'undefined' && shape[i]) {
        current[y][x] = id + 1;
      } else {
        current[y][x] = 0;
      }
    }
  }

  // ブロックを盤面の上の方にセットする
  currentX = 5;
  currentY = 0;
}

// メインループ
function tick() {
  // 1つ下へ移動する
  if (valid(0, 1)) {
    ++currentY;
  } else { // もし着地していたら(1つ下にブロックがあったら)
    freeze();
    clearLines();
    if(lose) {
      newGame();
      return false;
    }

    // 新しいブロックのセット
    newShape();
  }
}

// 指定された方向に操作ブロックを動かせるかどうかチェック
// ゲームオーバーの判定も行う
function valid(offsetX, offsetY, newCurrent) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  offsetX = currentX + offsetX;
  offsetY = currentY + offsetY;
  newCurrent = newCurrent || current;
  for (var y = 0; y < 4; ++y) {
    for (var x = 0; x < 4; ++x) {
      if (newCurrent[y][x]) {
        if (typeof board[y+offsetY] == 'undefined'
          || typeof board[y+offsetY][x+offsetX] == 'undefined'
          || board[y+offsetY][x+offsetX]
          || x + offsetX < 0
          || y + offsetY >= ROWS
          || x + offsetX >= COLS
        ) {

          if (offsetY == 1
            && offsetX - currentX == 0
            && offsetY - currentY == 1
          ) {
            console.log('game over');
            lose = true;
          }

          return false;
        }
      }
    }
  }

  return true;
}

// 操作ブロックを盤面に固定
function freeze() {
  for (var y = 0; y < 4; ++y) {
    for (var x = 0; x < 4; ++x) {
      if (current[y][x]) {
        board[y+currentY][x+currentX] = current[y][x];
      }
    }
  }
}

function playPromise(elementId) {
  document.getElementById(elementId).load();
  return document.getElementById(elementId).play();
}

// １行が揃っているか調べ, 揃っていたらそれらを消す
function clearLines() {
  for (var y = ROWS - 1; y >= 0; --y) {
    var rowFilled = true;
    for (var x = 0; x < COLS; ++x) {
      if (board[y][x] == 0) {
        rowFilled = false;
        break;
      }
    }

    // １行揃っていたら消す
    if (rowFilled) {
      // サウンドを鳴らす
      playPromise('clearsound').then(function() {
        // Automatic playback started!
      }).catch(function(error) {
        // Automatic playback failed.
        // Show a UI element to let the user manually start playback.
      });

      // その上にあったブロックを１つずつ落とす
      for (var yy = y; yy > 0; --yy) {
        for (var xx = 0; xx < COLS; ++xx) {
          board[yy][xx] = board[yy-1][xx];
        }
      }

      ++y; // １行落としたのでチェック処理を１つ下へ送る
    }
  }
}


function newGame() {
  clearInterval(interval); // ゲームタイマーをクリア
  init(); // 盤面の初期化
  newShape(); // 操作ブロックをセット
  lose = false;
  interval = setInterval(tick, 250); // 250ミリ秒ごとにtick関数の呼び出し
}

// 開始
newGame();
