import { useState } from 'react';
import type { OrderStatus, OrderView } from '../types';
import { addPayment } from '../api';
import { formatMoney } from '../format';

const STATUS_META: Record<OrderStatus, { cls: string; label: string }> = {
  unpaid: { cls: 'err', label: 'Не оплачено' },
  partial: { cls: 'warn', label: 'Частично' },
  paid: { cls: 'ok', label: 'Оплачено' },
};

interface Props {
  orders: OrderView[];
  onPaid: () => void;
}

export function OrdersTable({ orders, onPaid }: Props) {
  return (
    <div className="section">
      <div className="section-head">
        <div className="title">
          Заказы <span className="count">{orders.length}</span>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="empty">
          <div className="icon">∅</div>
          <h3>Заказов нет</h3>
          <p>Для этого профиля ещё не создано ни одного заказа.</p>
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th className="idx">#</th>
              <th>Номер</th>
              <th className="num">Сумма</th>
              <th className="num">Оплачено</th>
              <th className="num">Остаток</th>
              <th>Статус</th>
              <th className="actions-col">Оплата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <OrderRow key={order.id} order={order} index={index + 1} onPaid={onPaid} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrderRow({
  order,
  index,
  onPaid,
}: {
  order: OrderView;
  index: number;
  onPaid: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = STATUS_META[order.status];
  const remainClass = order.rest === 0 ? 'num remain-ok' : 'num remain-warn';

  async function handleApply() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Введите сумму');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addPayment(order.id, value);
      setAmount('');
      onPaid();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleApply();
    }
  }

  return (
    <tr>
      <td className="idx">{index}</td>
      <td>{order.number}</td>
      <td className="num">{formatMoney(order.amount)}</td>
      <td className="num">{formatMoney(order.paid)}</td>
      <td className={remainClass}>{formatMoney(order.rest)}</td>
      <td>
        <span className={`status ${meta.cls}`}>
          <span className="dot" />
          {meta.label}
        </span>
      </td>
      <td className="actions-col">
        {order.status === 'paid' ? (
          <span className="muted">—</span>
        ) : (
          <div className="pay" title={error ?? ''}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={order.rest}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onKeyDown={handleKey}
              placeholder={formatMoney(order.rest)}
              disabled={submitting}
            />
            <span
              className="pay-max"
              onClick={() => setAmount(String(order.rest))}
              title="Подставить остаток"
            >
              max
            </span>
            <button
              type="button"
              className="btn primary sm apply-btn"
              onClick={handleApply}
              disabled={submitting || !amount}
            >
              Оплатить
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
