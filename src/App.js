import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";
import { async } from "q";
import { func } from "prop-types";

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

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  //useEffect do the action only once. we use it here to call the data from supabase
  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");
        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }
        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(100);
        if (!error) setFacts(facts);
        else alert("There was an error. Please try again.");

        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      {/* HEADER */}
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Today I Learned!";
  return (
    <header className="header">
      <div className="logo">
        <img src="/logo.png" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large"
        id="shareFact"
        onClick={() => {
          setShowForm((showForm) => !showForm);
        }}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  // validate if a string have a URL format
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [sourceInput, setSourceInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    //1 prevent browser to reload
    e.preventDefault();
    //2 check if data is valid
    if (
      text &&
      isValidHttpUrl(sourceInput) &&
      categoryInput &&
      text.length <= 200
    ) {
      //3 upload fact to supabase and receive the new fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source: sourceInput, category: categoryInput }])
        .select();
      setIsUploading(false);
      // in the insert function we link the APP variable to the DB column for example
      // source: sourceInput, for  text value it was not necesary as they both share the same name

      //4 add the new fact to the UI(state) (when there is no error)
      if (!error) setFacts((facts) => [...facts, newFact[0]]);

      //5 close the form
      setText("");
      setSourceInput("http://example.com");
      setCategoryInput("");
      // 6 close the form
      // setShowForm((showForm) => !showForm);
    }
  }

  return (
    <form className="fact-form" id="form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={sourceInput}
        onChange={(e) => setSourceInput(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={categoryInput}
        onChange={(e) => setCategoryInput(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose Category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <CategoryItem
            key={cat.name}
            cat={cat}
            setCurrentCategory={setCurrentCategory}
          />
        ))}
      </ul>
    </aside>
  );
}

function CategoryItem({ cat, setCurrentCategory }) {
  return (
    <li className="category">
      <button
        className="btn btn-category"
        style={{ backgroundColor: cat.color }}
        onClick={() => setCurrentCategory(cat.name)}
      >
        {cat.name}
      </button>
    </li>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className="message">
        There are NO facts in this category. create the first one!!!
      </p>
    );
  // else
  return (
    <>
      <section>
        <ul id="fact-list">
          {facts.map((fact) => (
            <Fact key={fact.id} fact={fact} setFacts={setFacts} />
          ))}
        </ul>
        <p>There are {facts.length} facts in the category. Add your own!</p>
      </section>
    </>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    // hte function use the variable columnName to map the column name related to the vote it can be votesInteresting votesMindblowing or votesFalse
    setIsUpdating(true);
    // send the vote to supabase ro the related item (using eq('id')) and then getting the updated element with select() it gets stored in updatedFact
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    console.log(updatedFact);
    setIsUpdating(false);
    // if there is no error, the vote list gets updated
    if (!error)
      setFacts((facts) =>
        // as updatedFact is an Object we need to call the first element of it
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }
  return (
    <li className="fact">
      <p>
        {isDisputed ? (
          <span className="disputed">[⛔⛔⛔DISPUTED⛔⛔⛔] - </span>
        ) : null}
        {fact.text}
        <a href={fact.source} target="_blank" className="source">
          (Source)
        </a>
      </p>

      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find(({ name }) => name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => {
            handleVote("votesInteresting");
          }}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => {
            handleVote("votesMindblowing");
          }}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button
          onClick={() => {
            handleVote("votesFalse");
          }}
          disabled={isUpdating}
        >
          ⛔ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
