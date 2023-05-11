// selecting DOM elements
const btn = document.getElementById("shareFact");
const form = document.getElementById("form");
const factList = document.getElementById("fact-list");

//clear HTML
factList.innerHTML = "";

//Load DATA from supabase

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

async function loadFacts() {
  const res = await fetch(
    "https://sbpdocfncpsfkviqodey.supabase.co/rest/v1/facts",
    {
      headers: {
        apikey: "test",
        authorization: "Bearer test",
      },
    }
  );
  const data = await res.json();
  createFactList(data);
}

function createFactList(data) {
  const htmlArr = data.map(
    (fact) =>
      `<li class="fact">
                    <p>
                      ${fact.text}
                      <a
                        href="${fact.source}"
                        target="_blank"
                        class="source"
                        >(Source)</a
                      >
                    </p>
      
                    <span class="tag" style="background-color: ${
                      CATEGORIES.find(({ name }) => name === fact.category)
                        .color
                    } "
                      >${fact.category}</span
                    >
                    <div class="vote-buttons">
                      <button>👍${fact.votesInteresting}</button>
                      <button>🤯 ${fact.votesMindblowing}</button>
                      <button>⛔ ${fact.votesFalse}</button>
                    </div>
                  </li>`
  );
  htmlArr.forEach((fact) => {
    factList.insertAdjacentHTML("afterbegin", fact);
  });
}

loadFacts();

// Toggle form visibility

btn.addEventListener("click", function () {
  if (form.classList.contains("hidden")) {
    form.classList.remove("hidden");
    btn.textContent = "Close";
  } else {
    form.classList.add("hidden");
    btn.textContent = "Share a Fact";
  }
});
