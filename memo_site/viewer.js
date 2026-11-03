
let memos = [];

// お気に入りデータを保存
let favorites = JSON.parse(
  localStorage.getItem("memoFavorites") || "[]"
);

// JSONファイルから文章を読み込む
async function loadMemos() {
  const memoList = document.getElementById("memo-list");

  try {
    const response = await fetch("./articles.json");

    if (!response.ok) {
      throw new Error("データを読み込めませんでした");
    }

    memos = await response.json();

    updateCategories();
    displayMemos();

  } catch (error) {
    console.error(error);
    memoList.textContent = "文章データを読み込めませんでした。";
  }
}

// カテゴリー一覧
function updateCategories() {
  const select = document.getElementById("category-filter");

  const selectedCategory = select.value;

  const categories = [
    ...new Set(memos.map(memo => memo.category).filter(Boolean))
  ];

  select.innerHTML = '<option value="">すべてのカテゴリー</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  select.value = selectedCategory;
}

// 文章を表示
function displayMemos() {
  const memoList = document.getElementById("memo-list");

  const keyword = document.getElementById("search-input").value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  const favoritesOnly = document.getElementById("favorites-only").checked;

  const filtered = memos.filter(memo => {
    const text = `${memo.number ?? ""} ${memo.title ?? ""} ${memo.body ?? ""} ${memo.category ?? ""}`.toLowerCase();

    const isFavorite = favorites.includes(memo.number);

    return (
      text.includes(keyword) &&
      (!category || memo.category === category) &&
      (!favoritesOnly || isFavorite)
    );
  });

  document.getElementById("result-count").textContent =
    `${filtered.length}件`;

  memoList.innerHTML = "";

  if (filtered.length === 0) {
    memoList.textContent = "該当する文章はありません。";
    return;
  }

  filtered.forEach(memo => {
    const card = document.createElement("article");
    card.className = "memo-card";

    const number = document.createElement("p");
    number.textContent = `番号：${memo.number ?? ""}`;

    const title = document.createElement("h3");
    title.textContent = memo.title ?? "タイトルなし";

    const categoryTag = document.createElement("span");
    categoryTag.textContent = memo.category ?? "未分類";

    const body = document.createElement("p");
    body.textContent = memo.body ?? "";

    const favoriteButton = document.createElement("button");
    const isFavorite = favorites.includes(memo.number);

    favoriteButton.textContent = isFavorite ? "★ お気に入り解除" : "☆ お気に入り登録";
    favoriteButton.className = "favorite-button";

    favoriteButton.addEventListener("click", () => {
      toggleFavorite(memo.number);
    });

    card.append(
      number,
      title,
      categoryTag,
      body,
      favoriteButton
    );

    memoList.appendChild(card);
  });
}

// お気に入り登録・解除
function toggleFavorite(number) {
  if (favorites.includes(number)) {
    favorites = favorites.filter(item => item !== number);
  } else {
    favorites.push(number);
  }

  localStorage.setItem(
    "memoFavorites",
    JSON.stringify(favorites)
  );

  displayMemos();
}

// 検索・絞り込み
document.getElementById("search-input")
  .addEventListener("input", displayMemos);

document.getElementById("category-filter")
  .addEventListener("change", displayMemos);

document.getElementById("favorites-only")
  .addEventListener("change", displayMemos);

// 起動
loadMemos();
