
let memos = [];

// HTML要素を取得
const form = document.getElementById("memo-form");
const numberInput = document.getElementById("memo-number");
const titleInput = document.getElementById("memo-title");
const categoryInput = document.getElementById("memo-category");
const bodyInput = document.getElementById("memo-body");
const editIndexInput = document.getElementById("edit-index");
const memoList = document.getElementById("admin-memo-list");
const message = document.getElementById("message");

// articles.jsonを読み込む
async function loadMemos() {
  try {
    const response = await fetch("./articles.json");

    if (!response.ok) {
      throw new Error("読み込みに失敗しました");
    }

    memos = await response.json();
    displayMemos();
  } catch (error) {
    console.error(error);
    memoList.textContent =
      "文章データを読み込めませんでした。";
  }
}

// 文章一覧を表示
function displayMemos() {
  memoList.innerHTML = "";

  if (memos.length === 0) {
    memoList.textContent = "登録されている文章はありません。";
    return;
  }

  memos.forEach((memo, index) => {
    const card = document.createElement("article");
    card.className = "memo-card";

    const number = document.createElement("p");
    number.textContent = `番号：${memo.number}`;

    const title = document.createElement("h3");
    title.textContent = memo.title;

    const category = document.createElement("span");
    category.textContent = memo.category;

    const body = document.createElement("p");
    body.textContent = memo.body;

    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.addEventListener("click", () => {
      editMemo(index);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      deleteMemo(index);
    });

    card.append(
      number,
      title,
      category,
      body,
      editButton,
      deleteButton
    );

    memoList.appendChild(card);
  });
}

// 新規登録・編集の保存
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const number = numberInput.value.trim();
  const title = titleInput.value.trim();
  const category = categoryInput.value.trim();
  const body = bodyInput.value.trim();

  if (!number || !title || !category || !body) {
    message.textContent = "すべての項目を入力してください。";
    return;
  }

  const editIndex = editIndexInput.value;

  // 番号の重複チェック
  const duplicate = memos.some((memo, index) => {
    return memo.number === number &&
      String(index) !== editIndex;
  });

  if (duplicate) {
    message.textContent = "この番号はすでに使用されています。";
    return;
  }

  const newMemo = {
    number,
    title,
    category,
    body
  };

  if (editIndex === "") {
    memos.push(newMemo);
    message.textContent = "文章を追加しました。";
  } else {
    memos[Number(editIndex)] = newMemo;
    message.textContent = "文章を編集しました。";
  }

  resetForm();
  displayMemos();
});

// 編集
function editMemo(index) {
  const memo = memos[index];

  numberInput.value = memo.number;
  titleInput.value = memo.title;
  categoryInput.value = memo.category;
  bodyInput.value = memo.body;

  editIndexInput.value = index;

  document.getElementById("form-heading").textContent =
    "文章を編集";

  document.getElementById("save-button").textContent =
    "変更を保存";

  document.getElementById("cancel-button").hidden = false;

  message.textContent = "編集内容を入力してください。";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// 削除
function deleteMemo(index) {
  const result = confirm(
    `「${memos[index].title}」を削除しますか？`
  );

  if (!result) return;

  memos.splice(index, 1);

  resetForm();
  displayMemos();

  message.textContent = "文章を削除しました。";
}

// フォームを初期状態に戻す
function resetForm() {
  form.reset();
  editIndexInput.value = "";

  document.getElementById("form-heading").textContent =
    "新しい文章を登録";

  document.getElementById("save-button").textContent =
    "登録する";

  document.getElementById("cancel-button").hidden = true;
}

// 編集キャンセル
document.getElementById("cancel-button")
  .addEventListener("click", () => {
    resetForm();
    message.textContent = "編集をキャンセルしました。";
  });

// JSONファイルとして書き出す
document.getElementById("export-button")
  .addEventListener("click", () => {
    const json = JSON.stringify(memos, null, 2);

    const blob = new Blob(
      [json],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "articles.json";
    link.click();

    URL.revokeObjectURL(url);

    message.textContent =
      "JSONファイルを書き出しました。";
  });

// JSONファイルを読み込む
document.getElementById("import-file")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!Array.isArray(data)) {
          throw new Error("データ形式が正しくありません");
        }

        const valid = data.every(memo =>
          memo &&
          typeof memo.number === "string" &&
          typeof memo.title === "string" &&
          typeof memo.category === "string" &&
          typeof memo.body === "string"
        );

        if (!valid) {
          throw new Error("文章データの形式が正しくありません");
        }

        const numbers = data.map(memo => memo.number);

        if (new Set(numbers).size !== numbers.length) {
          throw new Error("番号が重複しています");
        }

        memos = data;
        resetForm();
        displayMemos();

        message.textContent =
          "JSONファイルを読み込みました。";
      } catch (error) {
        message.textContent =
          "読み込みに失敗しました：" + error.message;
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  });

// 起動
loadMemos();
