// Write your code here
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import HistoryList from "../components/HistoryList.jsx";
import CodeEditor from "../components/CodeEditor.jsx";

import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/historyService.js";

import "../styles/history.css";

function HistoryPage() {
  // =========================
  // State
  // =========================
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const ITEMS_PER_PAGE = 8;

  // =========================
  // Effects
  // =========================
  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  // =========================
  // API Functions
  // =========================
  const fetchHistory = async () => {
    setLoading(true);

    try {
      const data = await getHistory(currentPage, ITEMS_PER_PAGE);

      setEntries(data.entries);
      setTotalPages(data.totalPages);
      setTotalEntries(data.totalEntries);
    } catch {
      toast.error("Failed to load history");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);

      toast.success("Deleted");

      if (selectedEntry?._id === id) {
        setSelectedEntry(null);
      }

      fetchHistory();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete all history?")) return;

    try {
      const result = await clearHistory();

      toast.success(`Cleared ${result.deletedCount} entries`);

      setEntries([]);
      setTotalEntries(0);
      setTotalPages(1);
      setSelectedEntry(null);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to clear");
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <h1>History</h1>
        <p>{totalEntries} entries</p>

        <button
          className="clear-btn"
          onClick={handleClearAll}
          disabled={!entries.length}
        >
          Clear All
        </button>
      </div>

      {/* History List */}
      <HistoryList
        entries={entries}
        loading={loading}
        selectedEntry={selectedEntry}
        onSelect={setSelectedEntry}
        onDelete={handleDelete}
      />

      {/* Detail Panel */}
      {selectedEntry && (
        <div className="history-detail">
          <h2>{selectedEntry.type}</h2>

          {/* Input Code */}
          <div className="detail-section">
            <h3>Input</h3>

            <CodeEditor
              value={selectedEntry.input}
              language={selectedEntry.language}
              readOnly
            />
          </div>

          {/* Output */}
          <div className="detail-section">
            <h3>Output</h3>

            <div className="detail-output-box">
              {selectedEntry.type === "translate" && (
                <>
                  <span className="detail-lang-badge">
                    Target: {selectedEntry.targetLanguage}
                  </span>

                  <pre className="detail-code-block">
                    {selectedEntry.output?.translatedCode}
                  </pre>
                </>
              )}

              {selectedEntry.type === "analyze" && (
                <>
                  <div className="detail-complexity-row">
                    <div className="detail-complexity-card">
                      <div className="detail-complexity-label">Time</div>
                      <div className="detail-complexity-value">
                        {selectedEntry.output?.timeComplexity}
                      </div>
                    </div>

                    <div className="detail-complexity-card">
                      <div className="detail-complexity-label">Space</div>
                      <div className="detail-complexity-value">
                        {selectedEntry.output?.spaceComplexity}
                      </div>
                    </div>
                  </div>

                  {selectedEntry.output?.explanation && (
                    <p className="detail-text">
                      {selectedEntry.output.explanation}
                    </p>
                  )}
                </>
              )}

              {selectedEntry.type === "optimize" && (
                <>
                  <pre className="detail-code-block">
                    {selectedEntry.output?.optimizedCode}
                  </pre>

                  {selectedEntry.output?.suggestions && (
                    <p className="detail-text">
                      {selectedEntry.output.suggestions}
                    </p>
                  )}
                </>
              )}

              {selectedEntry.type === "explain" && (
                <p className="detail-text">
                  {selectedEntry.output?.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="history-pagination">
          <button
            className="page-btn"
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              className={`page-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;