/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Award, 
  HelpCircle, 
  X, 
  Loader, 
  Globe,
  Layers,
  ChevronRight
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

  // Probo Web Style Cascading Tab Selections
  const [activeTab, setActiveTab] = useState("All");
  const [activeSubTab, setActiveSubTab] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);

  // Dynamic Form Initializer States
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "", 
    customCategory: "",
    subCategory: "", 
    customSubCategory: "",
    language: "English", 
    initialThreshold: 50,
    maxInvestment: 20000,
    endTime: ""
  });

  // Infinite Options Tracker Array
  const [optionsList, setOptionsList] = useState(["", ""]); 
  const [winningOptionId, setWinningOptionId] = useState("");
  const [rewardPercentage, setRewardPercentage] = useState(0);

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

  // Reset Sub-Category Tab whenever parent Category Tab changes
  useEffect(() => {
    setActiveSubTab("All");
  }, [activeTab]);

  // Dynamic Unique Category Extraction from current Cluster Feeds
  const existingCategories = Array.from(
    new Set(questions.map((q) => q.category?.trim()).filter(Boolean))
  );

  // Extract unique sub-categories belonging ONLY to the currently chosen active category tab
  const activeCategoryContext = showCustomCategory ? newQuestion.customCategory : newQuestion.category;
  
  const existingSubCategories = Array.from(
    new Set(
      questions
        .filter((q) => {
          if (showAddModal) {
            return q.category?.trim().toLowerCase() === activeCategoryContext?.trim().toLowerCase();
          }
          if (activeTab === "All") return true;
          return q.category?.trim().toLowerCase() === activeTab.trim().toLowerCase();
        })
        .map((q) => q.subCategory?.trim())
        .filter(Boolean)
    )
  );

  // Probo Style Cascading Client Side Tab Filters
  const filteredQuestions = questions.filter((q) => {
    const matchCategory = activeTab === "All" || q.category?.trim().toLowerCase() === activeTab.trim().toLowerCase();
    const matchSubCategory = activeSubTab === "All" || q.subCategory?.trim().toLowerCase() === activeSubTab.trim().toLowerCase();
    return matchCategory && matchSubCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    
    if (optionsList.some(opt => !opt.trim())) {
      return alert("Please fill out or remove all blank option input elements.");
    }

    const clearCategory = showCustomCategory ? newQuestion.customCategory.trim() : newQuestion.category.trim();
    const clearSubCategory = showCustomSubCategory ? newQuestion.customSubCategory.trim() : newQuestion.subCategory.trim();

    if (!clearCategory) return alert("Please specify or choose a primary Category node.");

    try {
      const payload = {
        question: newQuestion.question,
        category: clearCategory,
        subCategory: clearSubCategory || "General",
        language: newQuestion.language,
        options: optionsList.map(opt => ({ optionText: opt.trim() })), 
        initialThreshold: Number(newQuestion.initialThreshold),
        maxInvestment: Number(newQuestion.maxInvestment),
        intervalTime: 0,
        endTime: new Date(newQuestion.endTime).toISOString()
      };

      const result = await createProductAPI(payload);
      if (result.success) {
        alert("New market question instantiated successfully!");
        setShowAddModal(false);
        setShowCustomCategory(false);
        setShowCustomSubCategory(false);
        setNewQuestion({
          question: "", category: "", customCategory: "", subCategory: "", customSubCategory: "", language: "English",
          initialThreshold: 50, maxInvestment: 20000, endTime: ""
        });
        setOptionsList(["", ""]); 
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
    setRewardPercentage(0);
    setShowSettleModal(true);
  };

  const handleDeclareResult = async (e) => {
    e.preventDefault();
    if (!winningOptionId) return alert("Please select a verified winning option node.");

    try {
      const response = await fetch(`${API_BASE_URL}api/products/declare-result/${selectedQuestion._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: winningOptionId, rewardPercentage: Number(rewardPercentage) })
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
      <div className="dashboard-app-bounded-container">
        
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

        {/* PROBO STYLE ROW 1: PRIMARY CATEGORIES BAR */}
        <nav className="probo-classification-filter-bar flex-nowrap">
          <button 
            className={`probo-tab-pill ${activeTab === "All" ? "tab-pill-active" : ""}`}
            onClick={() => { setActiveTab("All"); setCurrentPage(1); }}
          >
            All Markets
          </button>
          {existingCategories.map((cat) => (
            <button
              key={cat}
              className={`probo-tab-pill ${activeTab?.toLowerCase() === cat?.toLowerCase() ? "tab-pill-active" : ""}`}
              onClick={() => { setActiveTab(cat); setCurrentPage(1); }}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* PROBO STYLE ROW 2: SUB-CATEGORIES CASCADING BAR */}
        <nav className="probo-sub-classification-filter-bar">
          <div className="sub-classification-indicator">
            <span>Sub-Category</span> <ChevronRight size={12} />
          </div>
          <div className="sub-pills-horizontal-scroll">
            <button
              className={`probo-sub-tab-pill ${activeSubTab === "All" ? "sub-tab-pill-active" : ""}`}
              onClick={() => { setActiveSubTab("All"); setCurrentPage(1); }}
            >
              All {activeTab !== "All" ? activeTab : ""} Sub-Nodes
            </button>
            {existingSubCategories.map((sub) => (
              <button
                key={sub}
                className={`probo-sub-tab-pill ${activeSubTab?.toLowerCase() === sub?.toLowerCase() ? "sub-tab-pill-active" : ""}`}
                onClick={() => { setActiveSubTab(sub); setCurrentPage(1); }}
              >
                {sub}
              </button>
            ))}
          </div>
        </nav>

        {errorMessage && <div className="dashboard-error-notice">⚠️ {errorMessage}</div>}

        {/* CORE CONTENT LIST GRID */}
        <section className="dashboard-feed-viewport">
          {loading ? (
            <div className="dashboard-loading-spinner-box">
              <Loader className="animate-spin text-blue" size={40} />
              <p>Compiling system question index matrices rows...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="dashboard-empty-state-card">
              <p>No active prediction contracts found registered under the "{activeTab} • {activeSubTab}" hierarchy filter.</p>
            </div>
          ) : (
            <>
              <div className="dashboard-pagination-summary">
                Showing {paginatedQuestions.length} of {filteredQuestions.length} entries under <b>{activeTab} {activeSubTab !== "All" ? `> ${activeSubTab}` : ""}</b>
              </div>
              <div className="dashboard-linear-tiles-list">
                {paginatedQuestions.map((item) => (
                  <div key={item._id} className={`dashboard-question-row-tile ${item.status === "disclosed" ? "tile-disclosed-dim" : ""}`}>
                  
                  <div className="tile-left-metadata">
                    <div className="tile-badge-strip">
                      <span className="badge-category"><Layers size={12} style={{marginRight: 4}} /> {item.category} • {item.subCategory || "General"}</span>
                      <span className={`badge-status-pill ${item.status === "active" ? "status-active" : "status-closed"}`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className="badge-lang-tag"><Globe size={11} /> {item.language}</span>
                    </div>
                    <h3 className="tile-core-question-text">{item.question}</h3>
                    
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

            <div className="dashboard-pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
          )}
        </section>
      </div>

      {/* ==========================================================================
          MODAL 1: ADD NEW QUESTION (SMART DROPDOWNS ARCHITECTURE)
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
                  <label>Market Category Selection</label>
                  <select 
                    value={showCustomCategory ? "CUSTOM_NEW" : newQuestion.category}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM_NEW") {
                        setShowCustomCategory(true);
                        setNewQuestion(prev => ({ ...prev, category: "" }));
                      } else {
                        setShowCustomCategory(false);
                        setNewQuestion(prev => ({ ...prev, category: e.target.value }));
                      }
                    }}
                  >
                    <option value="">-- Choose Existing Registry Category --</option>
                    {existingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="CUSTOM_NEW" style={{fontWeight: "bold", color: "#1d4ed8"}}>+ Create New Custom Category</option>
                  </select>
                  {showCustomCategory && (
                    <input 
                      type="text" required placeholder="Type new category (e.g., Finance)" 
                      value={newQuestion.customCategory} style={{marginTop: "8px"}}
                      onChange={(e) => setNewQuestion({...newQuestion, customCategory: e.target.value})}
                    />
                  )}
                </div>

                <div>
                  <label>Sub-Category Selection</label>
                  <select 
                    value={showCustomSubCategory ? "CUSTOM_SUB_NEW" : newQuestion.subCategory}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM_SUB_NEW") {
                        setShowCustomSubCategory(true);
                        setNewQuestion(prev => ({ ...prev, subCategory: "" }));
                      } else {
                        setShowCustomSubCategory(false);
                        setNewQuestion(prev => ({ ...prev, subCategory: e.target.value }));
                      }
                    }}
                  >
                    <option value="">-- Choose Existing Sub-Category --</option>
                    {existingSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    <option value="CUSTOM_SUB_NEW" style={{fontWeight: "bold", color: "#1d4ed8"}}>+ Create New Custom Sub-Category</option>
                  </select>
                  {showCustomSubCategory && (
                    <input 
                      type="text" required placeholder="Type new sub-category (e.g., Stock)" 
                      value={newQuestion.customSubCategory} style={{marginTop: "8px"}}
                      onChange={(e) => setNewQuestion({...newQuestion, customSubCategory: e.target.value})}
                    />
                  )}
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
              <div className="form-full-row">
                <label>Reward Percentage (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={rewardPercentage}
                  onChange={(e) => setRewardPercentage(e.target.value)}
                  placeholder="Enter reward split ratio percentage..."
                />
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