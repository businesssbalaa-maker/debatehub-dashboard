/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Award, 
  HelpCircle, 
  X, 
  Loader, 
  Globe 
} from "lucide-react";
import { 
  API_BASE_URL,
  getAllProductsAPI, 
  createProductAPI, 
  updateProductAPI, 
  deleteProductAPI 
} from "./api"; 
import "./QuestionsDashboard.css";

export default function QuestionsDashboard() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Dynamic Form Initializer States
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "", // Self-entered raw string input
    subCategory: "", // Self-entered raw string input
    language: "English", // Strict mapping ["English", "Hindi"]
    initialThreshold: 50,
    maxInvestment: 20000,
    endTime: ""
  });

  // Infinite Options Tracker Array
  const [optionsList, setOptionsList] = useState(["", ""]); // Default with 2 options inputs
  const [winningOptionId, setWinningOptionId] = useState("");

  const loadAllQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllProductsAPI();
      if (response.success && response.products) {
        setQuestions(response.products);
      } else {
        setErrorMessage("Failed to populate master questions feed grid.");
      }
    } catch (err) {
      console.error("Dashboard operational matrix error:", err);
      setErrorMessage("Network timeout retrieving questions database metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllQuestions();
  }, []);

  // Handler to inject dynamic option inputs
  const addOptionField = () => setOptionsList([...optionsList, ""]);
  const removeOptionField = (index) => {
    if (optionsList.length <= 2) return alert("A minimum of 2 option targets is required.");
    setOptionsList(optionsList.filter((_, idx) => idx !== index));
  };
  const handleOptionTextChange = (index, value) => {
    const updated = [...optionsList];
    updated[index] = value;
    setOptionsList(updated);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    // Validate empty option allocations
    if (optionsList.some(opt => !opt.trim())) {
      return alert("Please fill out or remove all blank option input elements.");
    }

    try {
      const payload = {
        question: newQuestion.question,
        category: newQuestion.category.trim(),
        subCategory: newQuestion.subCategory.trim(),
        language: newQuestion.language,
        options: optionsList.map(opt => ({ optionText: opt.trim() })), // Maps any number of fields cleanly
        initialThreshold: Number(newQuestion.initialThreshold),
        maxInvestment: Number(newQuestion.maxInvestment),
        intervalTime: 0,
        endTime: new Date(newQuestion.endTime).toISOString()
      };

      const result = await createProductAPI(payload);
      if (result.success) {
        alert("New market question instantiated successfully!");
        setShowAddModal(false);
        setNewQuestion({
          question: "", category: "", subCategory: "", language: "English",
          initialThreshold: 50, maxInvestment: 20000, endTime: ""
        });
        setOptionsList(["", ""]); // Reset layout back to default baseline
        loadAllQuestions();
      } else {
        alert(result.message || "Failed to instantiate product question template.");
      }
    } catch (err) {
      alert("Error writing to cluster collection: " + err.message);
    }
  };

  const handleDeleteQuestion = async (id, text) => {
    if (!window.confirm(`Are you sure you want to permanently erase contract node:\n"${text}"?`)) return;
    try {
      const res = await deleteProductAPI(id);
      if (res.success) {
        alert("Question deleted successfully from database logs.");
        setQuestions(prev => prev.filter(item => item._id !== id));
      } else {
        alert(res.message || "Deletion sequence rejected by backend controller.");
      }
    } catch (err) {
      alert("Network exception processing hard deletion: " + err.message);
    }
  };

  const triggerSettleModal = (product) => {
    setSelectedQuestion(product);
    setWinningOptionId("");
    setShowSettleModal(true);
  };

  const handleDeclareResult = async (e) => {
    e.preventDefault();
    if (!winningOptionId) return alert("Please select a verified winning option node.");

    try {
      const response = await fetch(`${API_BASE_URL}api/products/declare-result/${selectedQuestion._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: winningOptionId })
      });
      
      const result = await response.json();
      if (result.success) {
        alert("Result successfully disclosed! Balances and user arrays synced.");
        setShowSettleModal(false);
        loadAllQuestions();
      } else {
        alert(result.message || "Settlement block processing failed.");
      }
    } catch (err) {
      alert("Error reporting outcome verification metrics: " + err.message);
    }
  };

  return (
    <div className="dashboard-control-page blue-light-theme">
      
      {/* HEADER COMPARTMENT BAR */}
      <header className="dashboard-action-top-bar">
        <div className="bar-left-meta">
          <h2><HelpCircle className="title-icon-blue" /> Question Operations Desk</h2>
          <p>Initialize, update, settle, and audit multi-option prediction parameters</p>
        </div>
        <button className="dashboard-add-pill-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add New Question
        </button>
      </header>

      {errorMessage && <div className="dashboard-error-notice">⚠️ {errorMessage}</div>}

      {/* CORE CONTENT LIST GRID */}
      <section className="dashboard-feed-viewport">
        {loading ? (
          <div className="dashboard-loading-spinner-box">
            <Loader className="animate-spin text-blue" size={40} />
            <p>Compiling system question index matrices rows...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="dashboard-empty-state-card">
            <p>No market contracts entries saved inside the cluster database logs right now.</p>
          </div>
        ) : (
          <div className="dashboard-linear-tiles-list">
            {questions.map((item) => (
              <div key={item._id} className={`dashboard-question-row-tile ${item.status === "disclosed" ? "tile-disclosed-dim" : ""}`}>
                
                <div className="tile-left-metadata">
                  <div className="tile-badge-strip">
                    <span className="badge-category">{item.category} • {item.subCategory || "General"}</span>
                    <span className={`badge-status-pill ${item.status === "active" ? "status-active" : "status-closed"}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <span className="badge-lang-tag"><Globe size={11} /> {item.language}</span>
                  </div>
                  <h3 className="tile-core-question-text">{item.question}</h3>
                  
                  {/* Dynamic Options Count Indicator Badge */}
                  <div className="tile-options-count-badge">
                    🔢 Pool Stack contains {item.options?.length || 0} Option Nodes
                  </div>

                  <div className="tile-volume-metrics-footer">
                    <span>Pool Stake Value: <b>₹{item.totalInvestment || 0}</b></span>
                    <span>Participants: <b>{item.totalParticipants || 0} Nodes</b></span>
                    <span>Ends: <b>{new Date(item.endTime).toLocaleDateString("en-IN")}</b></span>
                  </div>
                </div>

                <div className="tile-right-control-actions">
                  {item.status === "active" ? (
                    <button className="action-btn-settle" onClick={() => triggerSettleModal(item)}>
                      <Award size={14} /> Declare Result
                    </button>
                  ) : (
                    <div className="settled-disclosed-placeholder">✓ Settle Disclosed</div>
                  )}
                  <button className="action-btn-hard-delete" onClick={() => handleDeleteQuestion(item._id, item.question)}>
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==========================================================================
          MODAL 1: ADD NEW QUESTION (INFINITE OPTIONS & RAW INPUT CATEGORIES)
         ========================================================================== */}
      {showAddModal && (
        <div className="dashboard-modal-backdrop-mesh">
          <div className="dashboard-brutalist-modal-box">
            <div className="modal-header-row">
              <h3>■ INITIALIZE NEW PREDICTIVE CONTRACT</h3>
              <button className="modal-close-x" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateQuestion} className="modal-input-form-grid">
              <div className="form-full-row">
                <label>Question Prompt Text String</label>
                <textarea required value={newQuestion.question} onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})} placeholder="Enter query text prompt description..." />
              </div>

              <div className="form-split-half-row">
                <div>
                  <label>Category (Type your own)</label>
                  <input type="text" required placeholder="e.g., Tech, Finance, Crypto" value={newQuestion.category} onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})} />
                </div>
                <div>
                  <label>Sub-Category Tag (Type your own)</label>
                  <input type="text" required placeholder="e.g., EV & Automotive, Stock" value={newQuestion.subCategory} onChange={(e) => setNewQuestion({...newQuestion, subCategory: e.target.value})} />
                </div>
              </div>

              <div className="form-split-half-row">
                <div>
                  <label>Display Language Node</label>
                  <select value={newQuestion.language} onChange={(e) => setNewQuestion({...newQuestion, language: e.target.value})}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label>Expiration Timeline Boundary (End Time)</label>
                  <input type="datetime-local" required value={newQuestion.endTime} onChange={(e) => setNewQuestion({...newQuestion, endTime: e.target.value})} />
                </div>
              </div>

              {/* DYNAMIC INFINITE OPTION TARGET ALLOCATION STACK */}
              <div className="form-full-row dynamic-options-blueprint-area">
                <div className="dynamic-options-headline-row">
                  <label>Configure Option Target Matrix (Current Count: {optionsList.length})</label>
                  <button type="button" className="btn-add-option-field" onClick={addOptionField}>
                    + Append Option Node
                  </button>
                </div>
                
                <div className="infinite-inputs-scroller-box">
                  {optionsList.map((optionText, index) => (
                    <div key={index} className="option-field-row-input">
                      <span className="field-numerical-vector">#{index + 1}</span>
                      <input 
                        type="text" required placeholder={`Enter option text value...`} 
                        value={optionText} onChange={(e) => handleOptionTextChange(index, e.target.value)} 
                      />
                      {optionsList.length > 2 && (
                        <button type="button" className="btn-delete-option-field" onClick={() => removeOptionField(index)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-split-half-row">
                <div>
                  <label>Min Entry Threshold (INR)</label>
                  <input type="number" required value={newQuestion.initialThreshold} onChange={(e) => setNewQuestion({...newQuestion, initialThreshold: e.target.value})} />
                </div>
                <div>
                  <label>Max Bound Allocation Cap (INR)</label>
                  <input type="number" required value={newQuestion.maxInvestment} onChange={(e) => setNewQuestion({...newQuestion, maxInvestment: e.target.value})} />
                </div>
              </div>

              <div className="modal-actions-footer-row">
                <button type="button" className="btn-abort-modal" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-execute-modal">Instantiate Market Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESULT DISCLOSURE SETTLEMENT ENGINE */}
      {showSettleModal && selectedQuestion && (
        <div className="dashboard-modal-backdrop-mesh">
          <div className="dashboard-brutalist-modal-box modal-size-compact">
            <div className="modal-header-row">
              <h3>■ SETTLE OUTCOME DISCLOSURE ENGINE</h3>
              <button className="modal-close-x" onClick={() => setShowSettleModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleDeclareResult} className="modal-input-form-grid">
              <div className="form-full-row">
                <p className="settlement-question-preview-lbl">Targeting Resolution Block:</p>
                <h4 className="settlement-question-preview-val">{selectedQuestion.question}</h4>
              </div>
              <div className="form-full-row">
                <label>Select Verified Winning Option Node</label>
                <select required value={winningOptionId} onChange={(e) => setWinningOptionId(e.target.value)} className="settlement-select-dropdown">
                  <option value="">-- Click to assign verified choice --</option>
                  {selectedQuestion.options.map((opt) => (
                    <option key={opt._id} value={opt._id}>{opt.optionText}</option>
                  ))}
                </select>
              </div>
              <div className="modal-warning-ledger-notice">
                ⚠️ <b>CRITICAL SYSTEM WARNING:</b> Executing this operational step instantly triggers full balance transfers to winning wallets. This matrix operation cannot be rolled back.
              </div>
              <div className="modal-actions-footer-row">
                <button type="button" className="btn-abort-modal" onClick={() => setShowSettleModal(false)}>Cancel</button>
                <button type="submit" className="btn-execute-modal variant-danger-action">Disclose Outcome & Release Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}