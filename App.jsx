import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, ClipboardList, AlertTriangle, CheckCircle2, Edit3, X, Save, Trash2, Scissors, Search, TrendingUp } from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [orderSubTab, setOrderSubTab] = useState('all'); // all, unreceived, inStockUnsold, soldUnsettled, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [trendMode, setTrendMode] = useState('day'); // day, month, year

  // 1. 初始化时从浏览器的 localStorage 读取数据，实现本地持久化
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('luhuo_orders_pro');
    if (savedOrders) {
      try {
        return JSON.parse(savedOrders);
      } catch (e) {
        console.error('解析本地存储数据失败', e);
      }
    }
    return [
      { 
        id: 1, 
        shippingFee: 12, 
        orderDate: '2026-09-04',
        items: [
          { 
            id: 101, name: 'Apple Pencil Pro', spec: '白色标准版', sn: 'SN98765', buyPrice: 850, quantity: 1, 
            platform: '淘宝', payChannel: '招行卡', commission: 10, rebate: 20,
            inExpress: 'SF111', signDate: '2026-09-05', 
            sellPrice: 920, outExpress: 'SF999', outDate: '2026-09-06', shipper: '华强北档口', 
            unsoldReason: '', 
            settleDate: '2026-09-06', settleMethod: '支付宝', settleAmount: 920, settled: true,
            note: '自带官方赠品' 
          }
        ]
      }
    ];
  });

  // 2. 数据变化时自动同步到 localStorage
  useEffect(() => {
    localStorage.setItem('luhuo_orders_pro', JSON.stringify(orders));
  }, [orders]);

  const [form, setForm] = useState({
    items: [{ name: '', spec: '', sn: '', buyPrice: '', quantity: '1', platform: '', payChannel: '', commission: '', rebate: '', note: '' }],
    shippingFee: 0,
    orderDate: new Date().toISOString().split('T')[0]
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const addItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { name: '', spec: '', sn: '', buyPrice: '', quantity: '1', platform: '', payChannel: '', commission: '', rebate: '', note: '' }]
    });
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const addEditItemRow = () => {
    setEditForm({
      ...editForm,
      items: [...editForm.items, { id: Date.now(), name: '', spec: '', sn: '', buyPrice: '', quantity: '1', sellPrice: '', platform: '', payChannel: '', commission: '', rebate: '', inExpress: '', signDate: '', outExpress: '', outDate: '', shipper: '', unsoldReason: '', settleDate: '', settleMethod: '支付宝', settleAmount: '', settled: false, note: '' }]
    });
  };

  const removeEditItemRow = (index) => {
    if (editForm.items.length === 1) return;
    setEditForm({ ...editForm, items: editForm.items.filter((_, i) => i !== index) });
  };

  const handleEditItemChange = (index, field, value) => {
    const newItems = [...editForm.items];
    newItems[index][field] = value;
    
    if (field === 'settleAmount' || field === 'quantity') {
      const amt = Number(field === 'settleAmount' ? value : newItems[index].settleAmount || 0);
      const qty = Number(field === 'quantity' ? value : newItems[index].quantity || 1);
      if (qty > 0 && amt > 0) {
        newItems[index].sellPrice = Number((amt / qty).toFixed(2));
      }
    }

    setEditForm({ ...editForm, items: newItems });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.items[0].name || !form.items[0].buyPrice) {
      alert('请至少填写第一件商品的品名和买入单价！');
      return;
    }
    const processedItems = form.items.map(item => ({
      ...item,
      id: Date.now() + Math.random(),
      quantity: Number(item.quantity || 1),
      buyPrice: Number(item.buyPrice || 0),
      sellPrice: 0,
      commission: Number(item.commission || 0),
      rebate: Number(item.rebate || 0),
      inExpress: '', signDate: '', outExpress: '', outDate: '', shipper: '', unsoldReason: '',
      settleDate: '', settleMethod: '支付宝', settleAmount: 0, settled: false
    }));

    const newOrder = {
      id: Date.now(),
      ...form,
      items: processedItems,
      shippingFee: Number(form.shippingFee || 0)
    };

    setOrders([newOrder, ...orders]);
    setForm({
      items: [{ name: '', spec: '', sn: '', buyPrice: '', quantity: '1', platform: '', payChannel: '', commission: '', rebate: '', note: '' }],
      shippingFee: 0, orderDate: new Date().toISOString().split('T')[0]
    });
    setTab('orders');
  };

  const startEdit = (order) => {
    setEditingId(order.id);
    setEditForm({ ...JSON.parse(JSON.stringify(order)) });
  };

  const saveEdit = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...editForm, shippingFee: Number(editForm.shippingFee || 0) } : o));
    setEditingId(null);
  };

  const splitItemOut = (orderId, itemIndex) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.items.length <= 1) {
      alert('当前订单只剩最后一件商品，无需拆分！');
      return;
    }

    if (window.confirm('确定要将该商品拆分独立为一个新订单吗？')) {
      const itemToSplit = targetOrder.items[itemIndex];
      const remainingItems = targetOrder.items.filter((_, i) => i !== itemIndex);

      const newSplitOrder = {
        id: Date.now(),
        shippingFee: 0,
        orderDate: targetOrder.orderDate,
        items: [itemToSplit]
      };

      setOrders(orders.map(o => o.id === orderId ? { ...o, items: remainingItems } : o).concat(newSplitOrder));
      setEditingId(null);
    }
  };

  const deleteOrder = (id) => {
    if (window.confirm('确定要删除这个采购订单吗？')) {
      setOrders(orders.filter(o => o.id !== id));
      setEditingId(null);
    }
  };

  const getItemStatus = (item) => {
    if (item.settled || (Number(item.sellPrice || 0) > 0 && Number(item.settleAmount || 0) > 0)) return 'completed';
    if (!item.signDate) return 'unreceived';
    if (!item.outExpress && !item.sellPrice && !item.unsoldReason) return 'inStockUnsold';
    return 'soldUnsettled';
  };

  const getOrderFinancials = (o) => {
    const totalBuyCost = o.items.reduce((sum, item) => sum + (Number(item.buyPrice || 0) * Number(item.quantity || 1)), 0);
    const totalSellAmount = o.items.reduce((sum, item) => sum + (Number(item.sellPrice || 0) * Number(item.quantity || 1)), 0);
    const totalCommission = o.items.reduce((sum, item) => sum + Number(item.commission || 0), 0);
    const totalRebate = o.items.reduce((sum, item) => sum + Number(item.rebate || 0), 0);
    const ship = Number(o.shippingFee || 0);
    const netProfit = totalSellAmount > 0 ? (totalSellAmount + totalRebate - totalBuyCost - totalCommission - ship) : (totalRebate - totalCommission - ship);
    return { totalBuyCost, totalSellAmount, netProfit };
  };

  const getAllItemsWithOrderMeta = () => {
    let all = [];
    orders.forEach(o => {
      o.items.forEach(item => {
        all.push({ ...item, orderId: o.id, orderDate: o.orderDate, shippingFee: o.shippingFee });
      });
    });
    return all;
  };

  const allItems = getAllItemsWithOrderMeta();
  const invested = orders.reduce((s, o) => s + o.items.reduce((sum, i) => sum + (Number(i.buyPrice || 0) * Number(i.quantity || 1)) + Number(i.commission || 0), 0) + Number(o.shippingFee || 0), 0);
  const unpaid = allItems.filter(i => !i.signDate).reduce((s, i) => s + (Number(i.buyPrice || 0) * Number(i.quantity || 1)), 0);
  const totalProfit = orders.reduce((s, o) => s + getOrderFinancials(o).netProfit, 0);

  // 动态生成盈亏统计趋势数据（按天/按月/按年聚合已结算的收益）
  const getTrendData = () => {
    const map = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (item.settled && item.settleDate) {
          let key = item.settleDate;
          if (trendMode === 'month') key = item.settleDate.slice(0, 7);
          if (trendMode === 'year') key = item.settleDate.slice(0, 4);

          const buy = Number(item.buyPrice || 0) * Number(item.quantity || 1);
          const sell = Number(item.sellPrice || 0) * Number(item.quantity || 1);
          const comm = Number(item.commission || 0);
          const reb = Number(item.rebate || 0);
          const itemProfit = sell + reb - buy - comm;

          if (!map[key]) map[key] = 0;
          map[key] += itemProfit;
        }
      });
    });

    let arr = Object.keys(map).map(k => ({ date: k, profit: map[k] })).sort((a, b) => a.date.localeCompare(b.date));
    if (arr.length === 0) {
      arr = [{ date: trendMode === 'year' ? '2026' : trendMode === 'month' ? '2026-09' : '2026-09-06', profit: 0 }];
    }
    return arr;
  };

  const trendData = getTrendData();
  const maxProfitVal = Math.max(...trendData.map(d => Math.abs(d.profit)), 100);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 pb-24 font-sans select-none">
      
      <header className="bg-white px-5 py-4 sticky top-0 z-20 border-b border-gray-200 flex justify-between items-center shadow-xs">
        <h1 className="text-base font-bold tracking-tight text-gray-900">LUHUO 个人撸货记账 Pro</h1>
        <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-semibold">完整版</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        
        {/* 看板 */}
        {tab === 'dashboard' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-gray-400 text-xs font-medium">总投入（含佣金/运费）</div>
                <div className="text-xl font-bold mt-1 text-gray-900">¥{invested}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-gray-400 text-xs font-medium">未到货风险资金</div>
                <div className="text-xl font-bold mt-1 text-amber-600">¥{unpaid}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="text-gray-300 text-xs font-medium">预计总净利润</div>
                <div className="text-2xl font-extrabold mt-1 text-emerald-400">+¥{totalProfit}</div>
              </div>
            </div>

            {/* 📊 盈亏统计与收益趋势组件 (按天 / 按月 / 按年) */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>盈亏统计</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">投入产出与收益趋势分析</p>
                </div>
                
                <div className="bg-gray-100 p-0.5 rounded-xl flex text-xs font-medium">
                  <button onClick={() => setTrendMode('day')} className={`px-2.5 py-1 rounded-lg transition-all ${trendMode === 'day' ? 'bg-white shadow-xs font-bold text-black' : 'text-gray-500'}`}>按天</button>
                  <button onClick={() => setTrendMode('month')} className={`px-2.5 py-1 rounded-lg transition-all ${trendMode === 'month' ? 'bg-white shadow-xs font-bold text-black' : 'text-gray-500'}`}>按月</button>
                  <button onClick={() => setTrendMode('year')} className={`px-2.5 py-1 rounded-lg transition-all ${trendMode === 'year' ? 'bg-white shadow-xs font-bold text-black' : 'text-gray-500'}`}>按年</button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                <span className="text-xs text-gray-500 font-medium">已结算累计收益</span>
                <span className="text-lg font-extrabold text-emerald-600">
                  +¥{trendData.reduce((s, d) => s + d.profit, 0).toFixed(2)}
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 pt-1">
                {trendData.map((item, idx) => {
                  const barWidthPercent = Math.min(Math.round((Math.abs(item.profit) / maxProfitVal) * 100), 100);
                  const isPositive = item.profit >= 0;

                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="w-24 text-gray-500 font-mono font-medium">{item.date}</span>
                      <div className="flex-1 mx-3 bg-gray-100 h-3 rounded-full overflow-hidden relative">
                        <div className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${barWidthPercent}%` }}></div>
                      </div>
                      <span className={`w-20 text-right font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? `+${item.profit.toFixed(2)}` : item.profit.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={() => setTab('add')}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>录入新商品订单</span>
            </button>
          </div>
        )}

        {/* 入库页 */}
        {tab === 'add' && (
          <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-4 animate-fadeIn">
            <h2 className="text-sm font-bold text-gray-800 mb-1">📦 录入多商品采购订单</h2>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">1. 商品明细、渠道与独立备注</div>
                <button type="button" onClick={addItemRow} className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-lg">+ 添加商品</button>
              </div>

              {form.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-300 space-y-2 relative">
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItemRow(idx)} className="absolute right-2 top-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder={`品名 ${idx+1}`} value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} className="col-span-2 bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-black" />
                    <input type="number" placeholder="数量" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-black font-mono text-center" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="规格" value={item.spec} onChange={e => handleItemChange(idx, 'spec', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs" />
                    <input type="text" placeholder="SN号" value={item.sn} onChange={e => handleItemChange(idx, 'sn', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs font-mono" />
                    <input type="number" placeholder="买入单价" value={item.buyPrice} onChange={e => handleItemChange(idx, 'buyPrice', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="账号渠道" value={item.platform} onChange={e => handleItemChange(idx, 'platform', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs" />
                    <input type="text" placeholder="付款渠道" value={item.payChannel} onChange={e => handleItemChange(idx, 'payChannel', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="代下佣金(¥)" value={item.commission} onChange={e => handleItemChange(idx, 'commission', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs" />
                    <input type="number" placeholder="平台返利(¥)" value={item.rebate} onChange={e => handleItemChange(idx, 'rebate', e.target.value)} className="bg-white border border-gray-300 rounded p-2 text-xs" />
                  </div>
                  <input type="text" placeholder="商品备注（如：有赠品、好评返现等）" value={item.note} onChange={e => handleItemChange(idx, 'note', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-blue-600" />
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">2. 下单日期与初始运费</div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.orderDate} onChange={e => setForm({...form, orderDate: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" />
                <input type="number" placeholder="快递运费(¥)" value={form.shippingFee} onChange={e => setForm({...form, shippingFee: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" />
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-md mt-2 flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>确认提交入库</span>
            </button>
          </form>
        )}

        {/* 明细页 */}
        {tab === 'orders' && (
          <div className="space-y-3 animate-fadeIn">
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="搜索：入库单号 / 寄出单号 / 结算日期 / 下单日期 / SN号..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-black shadow-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1 bg-gray-300 p-1 rounded-xl text-[10px] font-medium text-center shadow-inner">
              <button onClick={() => setOrderSubTab('all')} className={`py-2 rounded-lg transition-all ${orderSubTab === 'all' ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-700'}`}>总明细</button>
              <button onClick={() => setOrderSubTab('unreceived')} className={`py-2 rounded-lg transition-all ${orderSubTab === 'unreceived' ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-700'}`}>未到货</button>
              <button onClick={() => setOrderSubTab('inStockUnsold')} className={`py-2 rounded-lg transition-all ${orderSubTab === 'inStockUnsold' ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-700'}`}>已入库</button>
              <button onClick={() => setOrderSubTab('soldUnsettled')} className={`py-2 rounded-lg transition-all ${orderSubTab === 'soldUnsettled' ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-700'}`}>已寄出/未售</button>
              <button onClick={() => setOrderSubTab('completed')} className={`py-2 rounded-lg transition-all ${orderSubTab === 'completed' ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-700'}`}>已完结</button>
            </div>

            <h2 className="text-sm font-bold text-gray-800 pt-1">订单明细列表 ({orders.length} 个采购单)</h2>
            
            {orders.map(o => {
              const fin = getOrderFinancials(o);
              const isEditing = editingId === o.id;

              const matchedItems = o.items.filter(item => {
                const st = getItemStatus(item);
                if (orderSubTab === 'unreceived' && st !== 'unreceived') return false;
                if (orderSubTab === 'inStockUnsold' && st !== 'inStockUnsold') return false;
                if (orderSubTab === 'soldUnsettled' && st !== 'soldUnsettled') return false;
                if (orderSubTab === 'completed' && st !== 'completed') return false;

                if (searchQuery.trim()) {
                  const q = searchQuery.trim().toLowerCase();
                  const matchInExpress = (item.inExpress || '').toLowerCase().includes(q);
                  const matchOutExpress = (item.outExpress || '').toLowerCase().includes(q);
                  const matchSettleDate = (item.settleDate || '').toLowerCase().includes(q);
                  const matchOrderDate = (o.orderDate || '').toLowerCase().includes(q);
                  const matchSn = (item.sn || '').toLowerCase().includes(q);
                  const matchName = (item.name || '').toLowerCase().includes(q);
                  const matchSpec = (item.spec || '').toLowerCase().includes(q);

                  if (!matchInExpress && !matchOutExpress && !matchSettleDate && !matchOrderDate && !matchSn && !matchName && !matchSpec) {
                    return false;
                  }
                }
                return true;
              });

              if (matchedItems.length === 0) return null;

              return (
                <div key={o.id} className="bg-white p-4 rounded-2xl border-2 border-gray-300 shadow-md space-y-3 transition-all">
                  
                  {!isEditing ? (
                    <>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <div className="text-xs text-gray-600 font-mono font-medium">
                          下单日期: {o.orderDate} | 快递费: ¥{o.shippingFee}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => startEdit(o)} className="text-gray-500 hover:text-black p-1"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => deleteOrder(o.id)} className="text-gray-500 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {matchedItems.map((item, idx) => {
                          const st = getItemStatus(item);

                          let deadlineStr = null;
                          let daysLeft = null;
                          let isWarning = false;
                          if (item.signDate) {
                            const sign = new Date(item.signDate);
                            const deadline = new Date(sign.getTime());
                            deadline.setDate(deadline.getDate() + 7);
                            daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                            deadlineStr = deadline.toISOString().split('T')[0];
                            if (st === 'inStockUnsold' && daysLeft <= 2 && daysLeft >= 0) {
                              isWarning = true;
                            }
                          }

                          return (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-300 space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-sm text-gray-900">{item.name} <span className="font-normal text-gray-500">({item.spec}) x{item.quantity}</span></div>
                                  <div className="text-gray-500 font-mono mt-0.5">渠道: {item.platform} | 付款: {item.payChannel} {item.sn && `| SN: ${item.sn}`}</div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  st === 'unreceived' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                  st === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' :
                                  st === 'inStockUnsold' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-purple-100 text-purple-700 border border-purple-300'
                                }`}>
                                  {st === 'unreceived' ? '未到货' : st === 'completed' ? '已完结' : st === 'inStockUnsold' ? '已入库未寄' : '已寄出/未售'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-gray-700 pt-1 border-t border-gray-200">
                                <div>入库单号: <span className="font-mono">{item.inExpress || '未填'}</span></div>
                                <div>签收日期: <span className="font-mono">{item.signDate || '未签收'}</span></div>
                              </div>

                              {item.signDate && (
                                <div className={`font-medium ${isWarning ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                                  7天无理由截止: {deadlineStr} (剩余 {daysLeft} 天) {isWarning && '⚠️ 临期注意！'}
                                </div>
                              )}

                              {(item.outExpress || item.outDate || item.shipper || item.sellPrice > 0) && (
                                <div className="grid grid-cols-2 gap-2 text-gray-700 pt-1 border-t border-gray-200">
                                  <div>寄出单号: <span className="font-mono">{item.outExpress || '未填'}</span> ({item.outDate || '未填日期'})</div>
                                  <div>出货人/档口: {item.shipper || '未填'}</div>
                                </div>
                              )}

                              {item.unsoldReason && (
                                <div className="text-rose-600 font-semibold bg-rose-50 p-1.5 rounded border border-rose-200">未售出原因: {item.unsoldReason}</div>
                              )}

                              {item.note && (
                                <div className="text-blue-700 bg-blue-50 p-1.5 rounded border border-blue-200">商品备注: {item.note}</div>
                              )}

                              {item.settled && (
                                <div className="text-emerald-800 font-medium pt-1 border-t border-gray-200 flex justify-between">
                                  <span>结算: {item.settleDate} ({item.settleMethod}) | 单价: ¥{item.sellPrice}</span>
                                  <span className="font-bold">回款: ¥{item.settleAmount}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-medium">
                        <div className="text-gray-600">采购总成本: ¥{fin.totalBuyCost} +运¥{o.shippingFee}</div>
                        <div className="font-bold text-emerald-700">预计净利: ¥{fin.netProfit}</div>
                      </div>
                    </>
                  ) : (
                    /* 编辑表单 */
                    <div className="space-y-3 pt-1">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-xs font-bold text-black">编辑采购订单</span>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-600">商品明细与独立生命周期编辑</label>
                          <button type="button" onClick={addEditItemRow} className="text-xs bg-black text-white px-2 py-0.5 rounded">+ 加商品</button>
                        </div>
                        {editForm.items.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-300 space-y-2 relative text-xs">
                            {editForm.items.length > 1 && (
                              <button type="button" onClick={() => removeEditItemRow(idx)} className="absolute right-2 top-2 text-red-500">删除</button>
                            )}
                            
                            <div className="flex justify-between items-center bg-amber-50 p-1.5 rounded border border-amber-200">
                              <span className="text-[11px] text-amber-800 font-medium">商品 {idx+1} 流转状态</span>
                              {editForm.items.length > 1 && (
                                <button type="button" onClick={() => splitItemOut(o.id, idx)} className="text-[11px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold flex items-center space-x-1 shadow-xs hover:bg-amber-700">
                                  <Scissors className="w-3 h-3" />
                                  <span>✂️ 拆分独立成单</span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-1">
                              <input type="text" placeholder="品名" value={item.name} onChange={e => handleEditItemChange(idx, 'name', e.target.value)} className="col-span-2 bg-white border border-gray-300 rounded p-1" />
                              <input type="number" placeholder="数量" value={item.quantity} onChange={e => handleEditItemChange(idx, 'quantity', e.target.value)} className="bg-white border border-gray-300 rounded p-1 text-center font-mono" />
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              <input type="text" placeholder="规格" value={item.spec} onChange={e => handleEditItemChange(idx, 'spec', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                              <input type="text" placeholder="SN号" value={item.sn} onChange={e => handleEditItemChange(idx, 'sn', e.target.value)} className="bg-white border border-gray-300 rounded p-1 font-mono" />
                              <input type="number" placeholder="买入单价" value={item.buyPrice} onChange={e => handleEditItemChange(idx, 'buyPrice', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="text" placeholder="账号渠道" value={item.platform} onChange={e => handleEditItemChange(idx, 'platform', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                              <input type="text" placeholder="付款渠道" value={item.payChannel} onChange={e => handleEditItemChange(idx, 'payChannel', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="number" placeholder="代下佣金(¥)" value={item.commission} onChange={e => handleEditItemChange(idx, 'commission', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                              <input type="number" placeholder="平台返利(¥)" value={item.rebate} onChange={e => handleEditItemChange(idx, 'rebate', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="text" placeholder="入库单号" value={item.inExpress} onChange={e => handleEditItemChange(idx, 'inExpress', e.target.value)} className="bg-white border border-gray-300 rounded p-1 font-mono" />
                              <input type="date" placeholder="签收日期" value={item.signDate} onChange={e => handleEditItemChange(idx, 'signDate', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="text" placeholder="寄出单号" value={item.outExpress} onChange={e => handleEditItemChange(idx, 'outExpress', e.target.value)} className="bg-white border border-gray-300 rounded p-1 font-mono" />
                              <input type="date" placeholder="寄出日期" value={item.outDate || ''} onChange={e => handleEditItemChange(idx, 'outDate', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="text" placeholder="出货人/档口" value={item.shipper} onChange={e => handleEditItemChange(idx, 'shipper', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                              <input type="number" placeholder="出货单价(自动算)" value={item.sellPrice} onChange={e => handleEditItemChange(idx, 'sellPrice', e.target.value)} className="bg-white border border-gray-300 rounded p-1 bg-gray-100" />
                            </div>
                            <input type="text" placeholder="未售出原因（选填）" value={item.unsoldReason} onChange={e => handleEditItemChange(idx, 'unsoldReason', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1 text-rose-600 font-medium" />
                            <input type="text" placeholder="商品备注（如有赠品、返现等）" value={item.note} onChange={e => handleEditItemChange(idx, 'note', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1 text-blue-600" />
                            
                            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-gray-200">
                              <input type="date" value={item.settleDate} onChange={e => handleEditItemChange(idx, 'settleDate', e.target.value)} className="bg-white border border-gray-300 rounded p-1" />
                              <select value={item.settleMethod} onChange={e => handleEditItemChange(idx, 'settleMethod', e.target.value)} className="bg-white border border-gray-300 rounded p-1">
                                <option value="支付宝">支付宝</option>
                                <option value="微信">微信</option>
                                <option value="银行卡">银行卡</option>
                              </select>
                              <input type="number" placeholder="结算金额" value={item.settleAmount} onChange={e => handleEditItemChange(idx, 'settleAmount', e.target.value)} className="bg-white border border-gray-300 rounded p-1 font-bold text-emerald-700" />
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                              <input type="checkbox" checked={item.settled} onChange={e => handleEditItemChange(idx, 'settled', e.target.checked)} className="w-3.5 h-3.5" />
                              <span className="font-bold text-emerald-700">商品已结算完结（归入已售出完结板块）</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-gray-500 font-medium">快递费(¥)</label>
                          <input type="number" value={editForm.shippingFee} onChange={e => setEditForm({...editForm, shippingFee: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded p-1.5 mt-0.5" />
                        </div>
                        <div>
                          <label className="text-gray-500 font-medium">下单日期</label>
                          <input type="date" value={editForm.orderDate} onChange={e => setEditForm({...editForm, orderDate: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded p-1.5 mt-0.5" />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg">取消</button>
                        <button onClick={() => saveEdit(o.id)} className="px-3 py-1 text-xs bg-black text-white rounded-lg flex items-center space-x-1">
                          <Save className="w-3 h-3" /><span>保存修改</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-20">
        <div className="max-w-md mx-auto flex justify-around py-2.5">
          <button onClick={() => setTab('dashboard')} className={`flex flex-col items-center flex-1 py-1 ${tab === 'dashboard' ? 'text-black font-bold' : 'text-gray-400'}`}>
            <LayoutGrid className="w-5 h-5 mb-1" />
            <span className="text-[11px]">看板</span>
          </button>
          <button onClick={() => setTab('add')} className={`flex flex-col items-center flex-1 py-1 ${tab === 'add' ? 'text-black font-bold' : 'text-gray-400'}`}>
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[11px]">入库</span>
          </button>
          <button onClick={() => setTab('orders')} className={`flex flex-col items-center flex-1 py-1 ${tab === 'orders' ? 'text-black font-bold' : 'text-gray-400'}`}>
            <ClipboardList className="w-5 h-5 mb-1" />
            <span className="text-[11px]">明细</span>
          </button>
        </div>
      </nav>

    </div>
  );
}