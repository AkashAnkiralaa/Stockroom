import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, CirclePlus, Search, X } from 'lucide-react'

type Product = {
  productId: string
  name: string
  price: number
  quantity: number
  category: string
}

type ProductForm = Omit<Product, 'price' | 'quantity'> & { price: string; quantity: string }

const emptyForm: ProductForm = { productId: '', name: '', price: '', quantity: '', category: '' }
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || body?.message || body?.error || `Request failed (${response.status})`)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setProducts(await request<Product[]>('/api/products'))
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const summary = useMemo(() => ({
    count: products.length,
    units: products.reduce((sum, product) => sum + product.quantity, 0),
    low: products.filter((product) => product.quantity < 5).length,
    value: products.reduce((sum, product) => sum + product.quantity * product.price, 0),
  }), [products])

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category || 'Uncategorized'))].sort((a, b) => a.localeCompare(b)),
    [products],
  )

  const categorySummary = useMemo(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      const category = product.category || 'Uncategorized'
      counts.set(category, (counts.get(category) ?? 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [products])

  const restockProducts = useMemo(
    () => products.filter((product) => product.quantity < 5).sort((a, b) => a.quantity - b.quantity),
    [products],
  )

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return products.filter((product) => {
      const matchesSearch = !query ||
        product.name.toLocaleLowerCase().includes(query) ||
        product.productId.toLocaleLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'All categories' ||
        (product.category || 'Uncategorized') === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  function startAdd() {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(true)
    setError('')
  }

  function startEdit(product: Product) {
    setForm({
      productId: product.productId,
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity),
      category: product.category || 'Uncategorized',
    })
    setEditing(product.productId)
    setShowForm(true)
    setError('')
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number(form.price)
    const quantity = Number(form.quantity)
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      setError('Enter a non-negative price and whole-number quantity.')
      return
    }
    try {
      if (editing) {
        await request<Product>(`/api/products/${encodeURIComponent(editing)}`, {
          method: 'PATCH',
          body: JSON.stringify({ price, quantity, category: form.category.trim() }),
        })
      } else {
        await request<Product>('/api/products', {
          method: 'POST',
          body: JSON.stringify({ ...form, price, quantity, category: form.category.trim() }),
        })
      }
      setShowForm(false)
      setForm(emptyForm)
      await loadProducts()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save product')
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Stockroom home">
          <span className="brand-mark"><Boxes size={21} strokeWidth={2.2} /></span>
          <span>stockroom<span className="brand-period">.</span></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active"><Boxes size={18} /> Inventory <span className="nav-count">{summary.count}</span></button>
        <div className="sidebar-note">
          <span className="note-icon"><ArrowDownToLine size={17} /></span>
          <strong>Stock overview</strong>
          <p>Keep an eye on your products and stay ready for what’s next.</p>
        </div>
        <div className="sidebar-footer"><span className="online-dot" /> LOCAL DATABASE <span className="version">v1.0</span></div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Inventory</strong></div>
          <div className="topbar-status"><span className="online-dot" /> All changes saved</div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR BUSINESS AT A GLANCE</div>
              <h1>Inventory</h1>
              <p className="subtitle">Manage products, track stock, and stay one step ahead.</p>
            </div>
            <button className="primary-button" onClick={startAdd}><CirclePlus size={18} /> Add product</button>
          </div>

          <div className="stats-grid">
            <StatCard label="Total products" value={summary.count.toLocaleString()} icon={<Boxes size={19} />} tone="green" foot="In your catalog" />
            <StatCard label="Units in stock" value={summary.units.toLocaleString()} icon={<ArrowDownToLine size={19} />} tone="blue" foot="Across all products" />
            <StatCard label="Low stock" value={summary.low.toLocaleString()} icon={<AlertTriangle size={19} />} tone={summary.low ? 'amber' : 'green'} foot="Below 5 units" warning={summary.low > 0} />
            <StatCard label="Stock value" value={currency.format(summary.value)} icon={<ArrowUpFromLine size={19} />} tone="purple" foot="Based on current prices" />
          </div>

          <section className="dashboard-grid" aria-label="Inventory insights">
            <article className="insight-card">
              <div className="insight-heading">
                <div><h2>Products by category</h2><p>How your catalog is organized</p></div>
                <span className="insight-badge">{categorySummary.length} {categorySummary.length === 1 ? 'category' : 'categories'}</span>
              </div>
              {categorySummary.length === 0 ? <div className="insight-empty">Categories will appear here as you add products.</div> :
                <div className="category-chart">
                  {categorySummary.map(([category, count], index) => (
                    <div className="chart-row" key={category}>
                      <div className="chart-label"><span>{category}</span><strong>{count}</strong></div>
                      <div className="chart-track"><span className={`chart-bar chart-color-${index % 5}`} style={{ width: `${Math.max(8, (count / summary.count) * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>}
            </article>
            <article className={`insight-card restock-card ${restockProducts.length ? 'has-alerts' : ''}`}>
              <div className="insight-heading">
                <div><h2><AlertTriangle size={16} /> Restock alerts</h2><p>Products with fewer than 5 units</p></div>
                <span className={`alert-count ${restockProducts.length ? 'alert-count-active' : ''}`}>{restockProducts.length}</span>
              </div>
              {restockProducts.length === 0 ? <div className="insight-empty restock-empty">Everything looks stocked up.</div> :
                <ul className="restock-list">
                  {restockProducts.slice(0, 4).map((product) => (
                    <li key={product.productId}>
                      <span className="restock-product"><strong>{product.name}</strong><small>{product.productId}</small></span>
                      <span className={`restock-quantity ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
                        {product.quantity === 0 ? 'Out of stock' : `${product.quantity} left`}
                      </span>
                    </li>
                  ))}
                  {restockProducts.length > 4 && <li className="more-alerts">+{restockProducts.length - 4} more need restocking</li>}
                </ul>}
            </article>
          </section>

          <section className="inventory-card">
            <div className="table-heading">
              <div><h2>All products <span className="table-count">{summary.count}</span></h2><p>A complete list of your inventory</p></div>
              <div className="table-tools">
                <label className="category-filter">
                  <span className="sr-only">Filter by category</span>
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    <option>All categories</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label className="search-box">
                  <Search size={17} />
                  <input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search by name or product ID" />
                  {search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
                  <kbd>⌘ K</kbd>
                </label>
              </div>
            </div>
            {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
            <div className="table-wrap">
              <table>
                <thead><tr><th>PRODUCT</th><th>PRODUCT ID</th><th>CATEGORY</th><th>PRICE</th><th>QUANTITY</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading ? <tr><td className="empty-state" colSpan={7}>Loading products…</td></tr> :
                    visibleProducts.length === 0 ? (
                      <tr><td className="empty-state" colSpan={7}>
                        <span className="empty-icon"><Boxes size={23} /></span>
                        <strong>{products.length ? 'No matching products' : 'Your inventory is empty'}</strong>
                        <span>{products.length ? 'Try another search or category.' : 'Add your first product to get started.'}</span>
                        {!products.length && <button className="text-button" onClick={startAdd}>Add a product <span>→</span></button>}
                      </td></tr>
                    ) : visibleProducts.map((product) => {
                      const low = product.quantity < 5
                      return <tr key={product.productId} className={low ? 'low-row' : ''}>
                        <td><div className="product-cell"><span className={`product-avatar hue-${product.name.charCodeAt(0) % 5}`}>{product.name.charAt(0).toUpperCase()}</span><strong>{product.name}</strong></div></td>
                        <td><span className="product-id">{product.productId}</span></td>
                        <td><span className="category-chip">{product.category || 'Uncategorized'}</span></td>
                        <td className="price-cell">{currency.format(product.price)}</td>
                        <td><span className="quantity">{product.quantity} <span>units</span></span></td>
                        <td><span className={`status-pill ${low ? 'status-low' : 'status-good'}`}><span />{low ? 'Low stock' : 'In stock'}</span></td>
                        <td><button className="edit-button" onClick={() => startEdit(product)}>Edit</button></td>
                      </tr>
                    })}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{visibleProducts.length}</strong> {visibleProducts.length === 1 ? 'product' : 'products'}</span><span><span className="online-dot" /> Updated just now</span></div>
          </section>
          <footer className="page-footer">Good inventory makes for a great day. <span>✳</span></footer>
        </div>
      </section>

      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-heading"><div><div className="eyebrow">{editing ? 'PRODUCT DETAILS' : 'GROW YOUR CATALOG'}</div><h2 id="modal-title">{editing ? 'Update product' : 'Add a product'}</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close dialog"><X size={19} /></button></div>
          <form onSubmit={saveProduct}>
            <label>Product name<input autoFocus required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Organic green tea" /></label>
            <label>Product ID<input required maxLength={50} disabled={Boolean(editing)} value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} placeholder="e.g. TEA-001" /></label>
            <label>Category<input required maxLength={60} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Beverages" /></label>
            <div className="form-row">
              <label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label>
              <label>Quantity in stock<input required type="number" min="0" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="0" /></label>
            </div>
            <p className="form-hint"><AlertTriangle size={14} /> Items with fewer than 5 units will be marked low stock.</p>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-button">{editing ? 'Save changes' : 'Add product'}</button></div>
          </form>
        </section>
      </div>}
    </main>
  )
}

function StatCard({ label, value, icon, tone, foot, warning = false }: { label: string; value: string; icon: React.ReactNode; tone: string; foot: string; warning?: boolean }) {
  return <article className={`stat-card ${warning ? 'stat-warning' : ''}`}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><div className="stat-value">{value}</div><div className="stat-foot">{warning && <AlertTriangle size={13} />}{foot}</div></article>
}

export default App
