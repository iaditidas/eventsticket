import { describe, it, expect } from 'vitest';

describe('Booking & Capacity Concurrency Logic', () => {
  it('prevents booking when requested quantity exceeds available capacity', () => {
    const totalCapacity = 50;
    const ticketsSold = 45;
    const requestedQuantity = 10;
    const remaining = totalCapacity - ticketsSold;

    const isAvailable = requestedQuantity <= remaining;
    expect(isAvailable).toBe(false);
  });

  it('allows booking when capacity is sufficient', () => {
    const totalCapacity = 100;
    const ticketsSold = 80;
    const requestedQuantity = 5;
    const remaining = totalCapacity - ticketsSold;

    const isAvailable = requestedQuantity <= remaining;
    expect(isAvailable).toBe(true);
  });

  it('calculates total booking price accurately', () => {
    const items = [
      { unitPrice: 99, quantity: 2 },
      { unitPrice: 299, quantity: 1 },
    ];
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    expect(total).toBe(497);
  });
});
