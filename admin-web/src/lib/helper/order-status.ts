export enum OrderStatus {
  Created = 'Created',
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Delivery = 'Delivery',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export function getOrderStatusFromText(text: string): OrderStatus | undefined {
  const formattedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  return Object.values(OrderStatus).find(status => status === formattedText);
}

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Created]: [OrderStatus.Pending],
  [OrderStatus.Pending]: [OrderStatus.Confirmed],
  [OrderStatus.Confirmed]: [OrderStatus.Delivery],
  [OrderStatus.Delivery]: [OrderStatus.Completed],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: [],
  [OrderStatus.Refunded]: []
};


export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  return validTransitions[currentStatus]?.[0] || null;
}

const roadMap: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Created]: [OrderStatus.Created],
  [OrderStatus.Pending]: [OrderStatus.Created, OrderStatus.Pending],
  [OrderStatus.Confirmed]: [OrderStatus.Created, OrderStatus.Pending, OrderStatus.Confirmed],
  [OrderStatus.Delivery]: [OrderStatus.Created, OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Delivery],
  [OrderStatus.Completed]: [OrderStatus.Created, OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Delivery, OrderStatus.Completed],
  [OrderStatus.Cancelled]: [OrderStatus.Cancelled],
  [OrderStatus.Refunded]: [OrderStatus.Refunded]
};

export function getRoadMap(currentStatus: OrderStatus): OrderStatus[] {
  return roadMap[currentStatus] || [];
}
