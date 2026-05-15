const titleInput = document.getElementById("title");
const memoArea = document.getElementById("memo");
const previewText = document.getElementById("preview-text");
const saveBtn = document.getElementById("save-btn");
const newBtn = document.getElementById("new-btn");
const memoList = document.getElementById("memo-list");

const qwertyMap = {
  q: "ㅂ",
  w: "ㅈ",
  e: "ㄷ",
  r: "ㄱ",
  t: "ㅅ",
  y: "ㅛ",
  u: "ㅕ",
  i: "ㅑ",
  o: "ㅐ",
  p: "ㅔ",
  a: "ㅁ",
  s: "ㄴ",
  d: "ㅇ",
  f: "ㄹ",
  g: "ㅎ",
  h: "ㅗ",
  j: "ㅓ",
  k: "ㅏ",
  l: "ㅣ",
  z: "ㅋ",
  x: "ㅌ",
  c: "ㅊ",
  v: "ㅍ",
  b: "ㅠ",
  n: "ㅜ",
  m: "ㅡ",
  Q: "ㅃ",
  W: "ㅉ",
  E: "ㄸ",
  R: "ㄲ",
  T: "ㅆ",
  O: "ㅒ",
  P: "ㅖ",
};

function convertEngToKor(text) {
  const disassembled = Hangul.d(text);
  const mapped = disassembled.map((char) => qwertyMap[char] || char);
  return Hangul.assemble(mapped);
}

memoArea.addEventListener("input", (e) => {
  const convertedText = convertEngToKor(e.target.value);
  previewText.textContent = convertedText;
  memoArea.value = convertedText;
});

titleInput.addEventListener("input", (e) => {
  titleInput.value = convertEngToKor(e.target.value);
});

// 🌟 삭제 기능이 추가된 리스트 렌더링 함수
function renderMemos() {
  chrome.storage.local.get(["memoArray"], (result) => {
    const memos = result.memoArray || [];
    memoList.innerHTML = "";

    memos.forEach((memo, index) => {
      const li = document.createElement("li");
      li.className = "memo-item";

      // 제목/날짜 영역과 삭제 버튼을 분리해서 HTML 생성
      li.innerHTML = `
        <div class="memo-info">
          <strong>${memo.title || "제목 없음"}</strong>
          <span class="memo-date">${memo.date}</span>
        </div>
        <button class="delete-btn" title="삭제">❌</button>
      `;

      // 1. 메모 불러오기 (리스트 배경 클릭 시)
      li.querySelector(".memo-info").addEventListener("click", () => {
        titleInput.value = memo.title;
        memoArea.value = memo.content;
        previewText.textContent = memo.content;
      });

      // 2. 메모 삭제하기 (X 버튼 클릭 시)
      li.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // 중요: 삭제 버튼을 누를 때 메모가 불러와지는 것을 막음

        if (confirm("이 메모를 정말 삭제하시겠습니까?")) {
          // 배열에서 해당 인덱스의 메모 1개 제거
          memos.splice(index, 1);

          // 스토리지 업데이트 후 목록 다시 그리기
          chrome.storage.local.set({ memoArray: memos }, () => {
            renderMemos();
            // 만약 지운 메모가 현재 화면에 띄워져 있다면 화면도 초기화
            if (
              titleInput.value === memo.title &&
              memoArea.value === memo.content
            ) {
              newBtn.click();
            }
          });
        }
      });

      memoList.appendChild(li);
    });
  });
}

newBtn.addEventListener("click", () => {
  titleInput.value = "";
  memoArea.value = "";
  previewText.textContent = "";
  titleInput.focus();
});

saveBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const content = memoArea.value.trim();

  if (!content) {
    alert("메모 내용을 입력해주세요!");
    return;
  }

  chrome.storage.local.get(["memoArray"], (result) => {
    const memos = result.memoArray || [];
    const newMemo = {
      title: title,
      content: content,
      date:
        new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
    };

    memos.unshift(newMemo);

    chrome.storage.local.set({ memoArray: memos }, () => {
      titleInput.value = "";
      memoArea.value = "";
      previewText.textContent = "";
      renderMemos();
    });
  });
});

renderMemos();
