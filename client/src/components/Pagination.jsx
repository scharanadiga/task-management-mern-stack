export default function Pagination({ page, totalPages, total, limit, onChange }) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div>
      <div className="pagination">
        <button className="page-btn" onClick={() => onChange(page - 1)} disabled={page === 1}>
          &lsaquo;
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button className="page-btn" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
          &rsaquo;
        </button>
      </div>
      <p className="pagination-info">
        Showing {from}–{to} of {total} tasks
      </p>
    </div>
  );
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}
