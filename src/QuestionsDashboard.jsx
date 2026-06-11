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
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  API_BASE_URL,
  getAllProductsAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
  getcatgory, // 🚀 UPDATED: Using your specific explicit categories fetch handler API
  createCategoryAreaAPI,
  appendSubCategoryAPI,
  purgeCategoryAreaAPI,
  purgeSubCategoryAPI,
} from "./api";
import "./QuestionsDashboard.css";

export default function QuestionsDashboard() {
  const [questions, setQuestions] = useState([]);
  const [areas, setAreas] = useState([]); // Master state container sync with Area schema
  const [loading, setLoading] = useState(true);
  const [areasLoading, setAreasLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Probo Web Style Cascading Tab Selections
  const [activeTab, setActiveTab] = useState("All");
  const [activeSubTab, setActiveSubTab] = useState("All");

  // Modals Toggles Matrix Switches
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showManageAreasModal, setShowManageAreasModal] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New Dedicated Management Form Micro States
  const [mgmtCategory, setMgmtCategory] = useState("");
  const [mgmtSubCategory, setMgmtSubCategory] = useState("");
  const [targetParentCategory, setTargetParentCategory] = useState("");
  const [nestedSubToAppend, setNestedSubToAppend] = useState("");

  // Clean Product Add Initial State Form
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "",
    subCategory: "",
    language: "English",
    initialThreshold: 50,
    maxInvestment: 20000,
    endTime: "",
  });

  // Infinite Options Tracker Array
  const [optionsList, setOptionsList] = useState(["", ""]);
  const [winningOptionId, setWinningOptionId] = useState("");
  const [rewardPercentage, setRewardPercentage] = useState(0);

  // Sync taxonomy classification frameworks using your brand new API target hook
  const loadAllAreas = async () => {
    try {
      setAreasLoading(true);
      const res = await getcatgory(); // 🚀 CALLING YOUR EXACT DECLARED API HERE
      if (res && res.success && res.data) {
        setAreas(res.data);
      }
    } catch (err) {
      console.error(
        "Telemetry failed to retrieve classifications schema collections:",
        err,
      );
    } finally {
      setAreasLoading(false);
    }
  };

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
    loadAllAreas();
  }, []);

  // Reset Sub-Category Tab whenever parent Category Tab changes
  useEffect(() => {
    setActiveSubTab("All");
  }, [activeTab]);

  // Extract unique sub-categories context mapped to current choices selection lists
  const availableSubCategoriesForCreationForm =
    areas.find((a) => a.Category?.trim() === newQuestion.category?.trim())
      ?.SubCategory || [];

  // Probo Style Cascading Client Side Tab Filters
  const filteredQuestions = questions.filter((q) => {
    const matchCategory =
      activeTab === "All" ||
      q.category?.trim().toLowerCase() === activeTab.trim().toLowerCase();
    const matchSubCategory =
      activeSubTab === "All" ||
      q.subCategory?.trim().toLowerCase() === activeSubTab.trim().toLowerCase();
    return matchCategory && matchSubCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / itemsPerPage),
  );
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handler to inject dynamic option inputs
  const addOptionField = () => setOptionsList([...optionsList, ""]);
  const removeOptionField = (index) => {
    if (optionsList.length <= 2)
      return alert("A minimum of 2 option targets is required.");
    setOptionsList(optionsList.filter((_, idx) => idx !== index));
  };
  const handleOptionTextChange = (index, value) => {
    const updated = [...optionsList];
    updated[index] = value;
    setOptionsList(updated);
  };

  /* ==========================================================================
     CATEGORIES & SUB-CATEGORIES INTERNAL DISPATCH OPERATIONAL FLOW HANDLERS
     ========================================================================== */
  const handleCreateCategoryContext = async (e) => {
    e.preventDefault();
    if (!mgmtCategory.trim())
      return alert("Please specify a root Category title.");

    const res = await createCategoryAreaAPI(
      mgmtCategory.trim(),
      mgmtSubCategory.trim(),
    );
    if (res && res.success) {
      alert(
        "New Category node initialized successfully into schema tracking maps.",
      );
      setMgmtCategory("");
      setMgmtSubCategory("");
      loadAllAreas();
    } else {
      alert(
        res?.message || "Operation rejected by validation parameters filters.",
      );
    }
  };

  const handleAppendSubCategoryContext = async (e) => {
    e.preventDefault();
    if (!targetParentCategory || !nestedSubToAppend.trim()) {
      return alert(
        "Specify target parent mapping layer and sub-category context value node string.",
      );
    }

    const res = await appendSubCategoryAPI(
      targetParentCategory,
      nestedSubToAppend.trim(),
    );
    if (res && res.success) {
      alert("Sub-Category node added successfully.");
      setNestedSubToAppend("");
      loadAllAreas();
    } else {
      alert(res?.message || "Failed to inject target branch layout node.");
    }
  };

  const handlePurgeCategoryContext = async (catName) => {
    if (
      !window.confirm(
        `⚠️ CRITICAL REFACTOR: Erasing "${catName}" triggers automated CASCADE DELETIONS. Every single question registered under this category index will be wiped out from the cluster permanently.\n\nAre you absolutely sure?`,
      )
    )
      return;

    const res = await purgeCategoryAreaAPI(catName);
    if (res && res.success) {
      alert(
        res.message ||
          "Category context and downstream contract nodes dropped.",
      );
      if (activeTab === catName) setActiveTab("All");
      loadAllAreas();
      loadAllQuestions();
    }
  };

  const handlePurgeSubCategoryContext = async (catName, subName) => {
    if (
      !window.confirm(
        `⚠️ CRITICAL REFACTOR: Erasing sub-category node "${subName}" will cascade erase all questions linked to it.\n\nProceed?`,
      )
    )
      return;

    const res = await purgeSubCategoryAPI(catName, subName);
    if (res && res.success) {
      alert(res.message || "Sub-category branch dropped.");
      loadAllAreas();
      loadAllQuestions();
    }
  };

  /* ==========================================================================
     STANDARD PRODUCT QUESTION MANAGEMENT HANDLING ENGINE HOOKS
     ========================================================================== */
  const handleCreateQuestion = async (e) => {
    e.preventDefault();

    if (optionsList.some((opt) => !opt.trim())) {
      return alert(
        "Please fill out or remove all blank option input elements.",
      );
    }
    if (!newQuestion.category || !newQuestion.subCategory) {
      return alert(
        "Please select a verified registered Category and Sub-Category node from the system listings options.",
      );
    }

    try {
      const payload = {
        question: newQuestion.question,
        category: newQuestion.category,
        subCategory: newQuestion.subCategory,
        language: newQuestion.language,
        options: optionsList.map((opt) => ({ optionText: opt.trim() })),
        initialThreshold: Number(newQuestion.initialThreshold),
        maxInvestment: Number(newQuestion.maxInvestment),
        rewardPercentage: Number(rewardPercentage),
        intervalTime: 0,
        endTime: new Date(newQuestion.endTime).toISOString(),
      };

      const result = await createProductAPI(payload);
      if (result.success) {
        alert("New market question instantiated successfully!");
        setShowAddModal(false);
        setNewQuestion({
          question: "",
          category: "",
          subCategory: "",
          language: "English",
          initialThreshold: 50,
          maxInvestment: 20000,
          endTime: "",
        });
        setOptionsList(["", ""]);
        loadAllQuestions();
        loadAllAreas(); // Reload areas to update item counts smoothly
      } else {
        alert(
          result.message || "Failed to instantiate product question template.",
        );
      }
    } catch (err) {
      alert("Error writing to cluster collection: " + err.message);
    }
  };

  // 🚀 FIXED FUNCTION: Safely isolates question deletion without touching categories structures
  const handleDeleteQuestion = async (id, text) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete this question:\n"${text}"?\n\n(Note: Your categories and sub-categories will remain safe!)`,
      )
    )
      return;
    try {
      const res = await deleteProductAPI(id);
      if (res.success) {
        alert("Question deleted successfully from database logs.");
        // React State updates locally to avoid full page re-fetching lags
        setQuestions((prev) => prev.filter((item) => item._id !== id));
        loadAllAreas(); // Refresh area tree counts perfectly
      } else {
        alert(
          res.message || "Deletion sequence rejected by backend controller.",
        );
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
    if (!winningOptionId)
      return alert("Please select a verified winning option node.");

    try {
      const response = await fetch(
        `${API_BASE_URL}api/products/declare-result/${selectedQuestion._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId: winningOptionId }),
        },
      );

      const result = await response.json();
      if (result.success) {
        alert(
          "Result successfully disclosed! Balances and user arrays synced.",
        );
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
            <h2>
              <HelpCircle className="title-icon-blue" /> Question Operations
              Desk
            </h2>
            <p>
              Initialize, update, settle, and audit multi-option prediction
              parameters
            </p>
          </div>
          <div
            className="header-actions-pills-cluster-row"
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            <button
              className="dashboard-add-pill-btn secondary-grey-variant"
              onClick={() => setShowManageAreasModal(true)}
            >
              <Settings size={16} style={{ marginRight: 6 }} /> Manage
              Categories Hub
            </button>
            <button
              className="dashboard-add-pill-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Add New Question
            </button>
          </div>
        </header>

        {/* PROBO STYLE ROW 1: PRIMARY CATEGORIES BAR */}
        <nav className="probo-classification-filter-bar flex-nowrap">
          <button
            className={`probo-tab-pill ${activeTab === "All" ? "tab-pill-active" : ""}`}
            onClick={() => {
              setActiveTab("All");
              setCurrentPage(1);
            }}
          >
            All Markets
          </button>
          {areas.map((area) => (
            <button
              key={area._id}
              className={`probo-tab-pill ${activeTab?.toLowerCase() === area.Category?.trim().toLowerCase() ? "tab-pill-active" : ""}`}
              onClick={() => {
                setActiveTab(area.Category?.trim());
                setCurrentPage(1);
              }}
            >
              {area.Category}
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
              onClick={() => {
                setActiveSubTab("All");
                setCurrentPage(1);
              }}
            >
              All {activeTab !== "All" ? activeTab : ""} Sub-Nodes
            </button>
            {(
              areas.find(
                (a) =>
                  a.Category?.trim().toLowerCase() === activeTab.toLowerCase(),
              )?.SubCategory || []
            ).map((sub) => (
              <button
                key={sub._id}
                className={`probo-sub-tab-pill ${activeSubTab?.toLowerCase() === sub.name?.trim().toLowerCase() ? "sub-tab-pill-active" : ""}`}
                onClick={() => {
                  setActiveSubTab(sub.name?.trim());
                  setCurrentPage(1);
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </nav>

        {errorMessage && (
          <div className="dashboard-error-notice">⚠️ {errorMessage}</div>
        )}

        {/* CORE CONTENT LIST GRID */}
        <section className="dashboard-feed-viewport">
          {loading ? (
            <div className="dashboard-loading-spinner-box">
              <Loader className="animate-spin text-blue" size={40} />
              <p>Compiling system question index matrices rows...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="dashboard-empty-state-card">
              <p>
                No active prediction contracts found registered under the "
                {activeTab} {activeSubTab !== "All" ? `> ${activeSubTab}` : ""}"
                classification filter.
              </p>
            </div>
          ) : (
            <>
              <div className="dashboard-pagination-summary">
                Showing {paginatedQuestions.length} of{" "}
                {filteredQuestions.length} entries under{" "}
                <b>
                  {activeTab}{" "}
                  {activeSubTab !== "All" ? `> ${activeSubTab}` : ""}
                </b>
              </div>
              <div className="dashboard-linear-tiles-list">
                {paginatedQuestions.map((item) => (
                  <div
                    key={item._id}
                    className={`dashboard-question-row-tile ${item.status === "disclosed" ? "tile-disclosed-dim" : ""}`}
                  >
                    <div className="tile-left-metadata">
                      <div className="tile-badge-strip">
                        <span className="badge-category">
                          <Layers size={12} style={{ marginRight: 4 }} />{" "}
                          {item.category} • {item.subCategory || "General"}
                        </span>
                        <span
                          className={`badge-status-pill ${item.status === "active" ? "status-active" : "status-closed"}`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                        <span className="badge-lang-tag">
                          <Globe size={11} /> {item.language}
                        </span>
                      </div>
                      <h3 className="tile-core-question-text">
                        {item.question}
                      </h3>

                      <div className="tile-options-count-badge">
                        🔢 Pool Stack contains {item.options?.length || 0}{" "}
                        Option Nodes
                      </div>

                      <div className="tile-volume-metrics-footer">
                        <span>
                          Pool Stake Value: <b>₹{item.totalInvestment || 0}</b>
                        </span>
                        <span>
                          Participants:{" "}
                          <b>{item.totalParticipants || 0} Nodes</b>
                        </span>
                        <span>
                          Ends:{" "}
                          <b>
                            {new Date(item.endTime).toLocaleDateString("en-IN")}
                          </b>
                        </span>
                      </div>
                    </div>

                    <div className="tile-right-control-actions">
                      {item.status === "active" ? (
                        <button
                          className="action-btn-settle"
                          onClick={() => triggerSettleModal(item)}
                        >
                          <Award size={14} /> Declare Result
                        </button>
                      ) : (
                        <div className="settled-disclosed-placeholder">
                          ✓ Settle Disclosed
                        </div>
                      )}
                      <button
                        className="action-btn-hard-delete"
                        onClick={() =>
                          handleDeleteQuestion(item._id, item.question)
                        }
                      >
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
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
          MODAL 1: ADD NEW QUESTION (STRICT SELECTION DROPDOWNS ENGINE ONLY)
         ========================================================================== */}
      {showAddModal && (
        <div className="dashboard-modal-backdrop-mesh">
          <div className="dashboard-brutalist-modal-box">
            <div className="modal-header-row">
              <h3>■ INITIALIZE NEW PREDICTIVE CONTRACT</h3>
              <button
                className="modal-close-x"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateQuestion}
              className="modal-input-form-grid"
            >
              <div className="form-full-row">
                <label>Question Prompt Text String</label>
                <textarea
                  required
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                  placeholder="Enter query text prompt description..."
                />
              </div>

              <div className="form-split-half-row">
                <div>
                  <label>Market Category Selection (Strict Dropdown)</label>
                  <select
                    required
                    value={newQuestion.category}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        category: e.target.value,
                        subCategory: "",
                      }))
                    }
                  >
                    <option value="">
                      -- Choose Registered Parent Category --
                    </option>
                    {areas.map((area) => (
                      <option key={area._id} value={area.Category}>
                        {area.Category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Sub-Category Selection (Strict Dropdown)</label>
                  <select
                    required
                    disabled={!newQuestion.category}
                    value={newQuestion.subCategory}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        subCategory: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      -- Choose Registered Nested Sub-Category --
                    </option>
                    {availableSubCategoriesForCreationForm.map((sub) => (
                      <option key={sub._id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-split-half-row">
                <div>
                  <label>Display Language Node</label>
                  <select
                    value={newQuestion.language}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        language: e.target.value,
                      })
                    }
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label>Expiration Timeline Boundary (End Time)</label>
                  <input
                    type="datetime-local"
                    required
                    value={newQuestion.endTime}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-full-row dynamic-options-blueprint-area">
                <div className="dynamic-options-headline-row">
                  <label>
                    Configure Option Target Matrix (Current Count:{" "}
                    {optionsList.length})
                  </label>
                  <button
                    type="button"
                    className="btn-add-option-field"
                    onClick={addOptionField}
                  >
                    + Append Option Node
                  </button>
                </div>

                <div className="infinite-inputs-scroller-box">
                  {optionsList.map((optionText, index) => (
                    <div key={index} className="option-field-row-input">
                      <span className="field-numerical-vector">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Enter option text value...`}
                        value={optionText}
                        onChange={(e) =>
                          handleOptionTextChange(index, e.target.value)
                        }
                      />
                      {optionsList.length > 2 && (
                        <button
                          type="button"
                          className="btn-delete-option-field"
                          onClick={() => removeOptionField(index)}
                        >
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
                  <input
                    type="number"
                    required
                    value={newQuestion.initialThreshold}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        initialThreshold: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Max Bound Allocation Cap (INR)</label>
                  <input
                    type="number"
                    required
                    value={newQuestion.maxInvestment}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        maxInvestment: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-full-row">
                <label>Reward Percentage (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={rewardPercentage}
                  onChange={(e) => setRewardPercentage(e.target.value)}
                  placeholder="Set reward split ratio percentage for winning allocations..."
                />
              </div>

              <div className="modal-actions-footer-row">
                <button
                  type="button"
                  className="btn-abort-modal"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-execute-modal">
                  Instantiate Market Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          🚀 NEW FIXED MODAL 3: SEPARATE COMPARTMENT FOR CATEGORY SYSTEM MANAGEMENTS
         ========================================================================== */}
      {showManageAreasModal && (
        <div className="dashboard-modal-backdrop-mesh">
          <div
            className="dashboard-brutalist-modal-box"
            style={{ maxWidth: "52rem" }}
          >
            <div className="modal-header-row">
              <h3>■ TAXONOMY REGISTRY STRUCTURE OPERATIONS</h3>
              <button
                className="modal-close-x"
                onClick={() => setShowManageAreasModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="modal-split-management-viewport-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "2rem",
                marginTop: "1rem",
              }}
            >
              {/* LEFT COLUMN: CREATION ENGINES CONTAINER FOR CATEGORY / SUBCATEGORIES */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Form Section A: Create Category Root */}
                <form
                  onSubmit={handleCreateCategoryContext}
                  className="limit-update-form"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    maxWidth: "100%",
                  }}
                >
                  <h4 className="h4-title" style={{ color: "#1e3a8a" }}>
                    Create New Category
                  </h4>
                  <div
                    className="form-full-row"
                    style={{ marginBottom: "10px" }}
                  >
                    <input
                      type="text"
                      required
                      placeholder="Enter Category Name (e.g., Crypto)"
                      value={mgmtCategory}
                      onChange={(e) => setMgmtCategory(e.target.value)}
                      className="input-field"
                      style={{ background: "#fff" }}
                    />
                  </div>
                  <div
                    className="form-full-row"
                    style={{ marginBottom: "12px" }}
                  >
                    <input
                      type="text"
                      placeholder="Initial Sub-Category Title (Optional)"
                      value={mgmtSubCategory}
                      onChange={(e) => setMgmtSubCategory(e.target.value)}
                      className="input-field"
                      style={{ background: "#fff" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-update"
                    style={{ backgroundColor: "#1d4ed8", width: "100%" }}
                  >
                    Initialize Category
                  </button>
                </form>

                {/* Form Section B: Append Nested SubCategory Link */}
                <form
                  onSubmit={handleAppendSubCategoryContext}
                  className="limit-update-form"
                  style={{
                    background: "#fdfdfd",
                    border: "1px solid #cbd5e1",
                    maxWidth: "100%",
                  }}
                >
                  <h4 className="h4-title" style={{ color: "#166534" }}>
                    Add Sub-Category to Existing
                  </h4>
                  <div
                    className="form-full-row"
                    style={{ marginBottom: "10px" }}
                  >
                    <select
                      required
                      value={targetParentCategory}
                      onChange={(e) => setTargetParentCategory(e.target.value)}
                      style={{
                        padding: "8px 10px",
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <option value="">-- Choose Target Parent --</option>
                      {areas.map((a) => (
                        <option key={a._id} value={a.Category}>
                          {a.Category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="form-full-row"
                    style={{ marginBottom: "12px" }}
                  >
                    <input
                      type="text"
                      required
                      placeholder="Enter Sub-Category Name (e.g., Bitcoin)"
                      value={nestedSubToAppend}
                      onChange={(e) => setNestedSubToAppend(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-update"
                    style={{ backgroundColor: "#16a34a", width: "100%" }}
                  >
                    Append Sub-Category
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: RENDER SCHEMAS TREE LIST WITH PURGE CONTROLS DELETES */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  maxHeight: "26rem",
                  overflowY: "auto",
                  background: "#ffffff",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.8125rem",
                    textTransform: "uppercase",
                    margin: "0 0 1rem 0",
                    color: "#475569",
                    fontWeight: "700",
                    textAlign: "left",
                  }}
                >
                  Registered Classification Systems Trees
                </h4>

                {areas.length === 0 ? (
                  <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                    No categories loaded.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {areas.map((area) => (
                      <div
                        key={area._id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          paddingBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#f8fafc",
                            padding: "6px 12px",
                            borderRadius: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "0.875rem",
                              color: "#0f172a",
                            }}
                          >
                            📁 {area.Category}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handlePurgeCategoryContext(area.Category)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div
                          style={{
                            paddingLeft: "1.5rem",
                            marginTop: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {area.SubCategory?.map((sub) => (
                            <div
                              key={sub._id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "0.8125rem",
                                color: "#475569",
                                padding: "2px 0",
                              }}
                            >
                              <span>
                                ↳ {sub.name}{" "}
                                <span
                                  style={{ fontSize: "10px", color: "#94a3b8" }}
                                >
                                  ({sub.questions?.length || 0} items)
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handlePurgeSubCategoryContext(
                                    area.Category,
                                    sub.name,
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {(!area.SubCategory ||
                            area.SubCategory.length === 0) && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                fontStyle: "italic",
                              }}
                            >
                              No nested sub-nodes populated.
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className="modal-actions-footer-row"
              style={{ marginTop: "1rem" }}
            >
              <button
                type="button"
                className="btn-execute-modal"
                onClick={() => setShowManageAreasModal(false)}
                style={{ backgroundColor: "#475569" }}
              >
                Dismiss Management Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESULT DISCLOSURE SETTLEMENT ENGINE */}
      {showSettleModal && selectedQuestion && (
        <div className="dashboard-modal-backdrop-mesh">
          <div className="dashboard-brutalist-modal-box modal-size-compact">
            <div className="modal-header-row">
              <h3>■ SETTLE OUTCOME DISCLOSURE ENGINE</h3>
              <button
                className="modal-close-x"
                onClick={() => setShowSettleModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleDeclareResult}
              className="modal-input-form-grid"
            >
              <div className="form-full-row">
                <p className="settlement-question-preview-lbl">
                  Targeting Resolution Block:
                </p>
                <h4 className="settlement-question-preview-val">
                  {selectedQuestion.question}
                </h4>
              </div>
              <div className="form-full-row">
                <label>Select Verified Winning Option Node</label>
                <select
                  required
                  value={winningOptionId}
                  onChange={(e) => setWinningOptionId(e.target.value)}
                  className="settlement-select-dropdown"
                >
                  <option value="">
                    -- Click to assign verified choice --
                  </option>
                  {selectedQuestion.options.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.optionText}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-warning-ledger-notice">
                ⚠️ <b>CRITICAL SYSTEM WARNING:</b> Executing this operational
                step instantly triggers full balance transfers to winning
                wallets. This matrix operation cannot be rolled back.
              </div>
              <div className="modal-actions-footer-row">
                <button
                  type="button"
                  className="btn-abort-modal"
                  onClick={() => setShowSettleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-execute-modal variant-danger-action"
                >
                  Disclose Outcome & Release Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
