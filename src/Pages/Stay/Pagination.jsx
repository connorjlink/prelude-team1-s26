function Pagination({current, onChange, total}) {
  return (
  <div className="stay-pagination-controls" data-testid="page-container">
    <button
      className="pagination-button"
      disabled={current === 1}
      onClick={() => onChange(current - 1)}
    >
      Previous
    </button>
    <button className="pagination-button is-active" aria-current="page">
      {current}
    </button>
    <button
      className="pagination-button"
      disabled={current === total}
      onClick={() => onChange(current + 1)}
    >
      Next
    </button>
  </div>
  );
}

export default Pagination;
