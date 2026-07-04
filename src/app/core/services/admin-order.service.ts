// ============================================================
// VOYÆ — Admin Order Service
// Mock data (32 orders) — swap signal initializer for HTTP call when ready
// ============================================================
import { Injectable, signal, computed } from '@angular/core';
import { AdminOrder, AdminOrderItem, AdminOrderStatus } from '../models/admin.models';

// ── Helpers ──────────────────────────────────────────────────
function customer(name: string, email: string) {
  return { name, email, initials: name.split(' ').map((p: string) => p[0]).join('').toUpperCase() };
}

function item(productId: string, name: string, color: string, quantity: number, price: number): AdminOrderItem {
  return { productId, name, color, quantity, price };
}

function order(
  id: string, date: string,
  cName: string, cEmail: string,
  items: AdminOrderItem[],
  status: AdminOrderStatus,
): AdminOrder {
  return {
    id, date,
    customer: customer(cName, cEmail),
    items,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    status,
  };
}

// ── Mock data ────────────────────────────────────────────────
// Distribution: 8 processing · 12 shipped · 10 delivered · 2 returned = 32
const MOCK_ORDERS: AdminOrder[] = [
  // ── Processing (8) ──────────────────────────────────────
  order('#VOY-1042','2024-06-28T14:22:00Z','Sophie Laurent',  'sophie.l@example.com',  [item('1','The Carry-On','Desert Sand',1,295),item('4','The Check-In','Desert Sand',1,395)], 'processing'),
  order('#VOY-1041','2024-06-27T09:15:00Z','Marc Dupont',     'marc.d@example.com',    [item('2','The Carry-On','Obsidian Black',1,295)],                                           'processing'),
  order('#VOY-1040','2024-06-26T16:48:00Z','Alex Chen',       'alex.c@example.com',    [item('7','The Large','Forest Green',1,445),item('1','The Carry-On','Desert Sand',1,295)],   'processing'),
  order('#VOY-1039','2024-06-25T11:30:00Z','Emma Wilson',     'emma.w@example.com',    [item('5','The Check-In','Slate Grey',1,395)],                                               'processing'),
  order('#VOY-1038','2024-06-24T08:55:00Z','James Rodriguez', 'james.r@example.com',   [item('3','The Carry-On','Chalk White',2,295)],                                              'processing'),
  order('#VOY-1037','2024-06-23T13:20:00Z','Isabelle Moreau', 'i.moreau@example.com',  [item('18','The Large','Navy Blue',1,445)],                                                  'processing'),
  order('#VOY-1036','2024-06-22T15:40:00Z','Lucas Martin',    'lucas.m@example.com',   [item('13','The Check-In','Obsidian Black',1,395),item('3','The Carry-On','Chalk White',1,295)], 'processing'),
  order('#VOY-1035','2024-06-21T10:05:00Z','Charlotte Brown', 'c.brown@example.com',   [item('7','The Large','Forest Green',1,445)],                                                'processing'),

  // ── Shipped (12) ────────────────────────────────────────
  order('#VOY-1034','2024-06-20T09:30:00Z','Noah Thompson',   'n.thompson@example.com',[item('1','The Carry-On','Desert Sand',1,295),item('7','The Large','Forest Green',1,445)],   'shipped'),
  order('#VOY-1033','2024-06-19T14:15:00Z','Olivia Park',     'olivia.p@example.com',  [item('5','The Check-In','Slate Grey',1,395)],                                               'shipped'),
  order('#VOY-1032','2024-06-18T11:22:00Z','Ethan Davis',     'ethan.d@example.com',   [item('2','The Carry-On','Obsidian Black',1,295)],                                           'shipped'),
  order('#VOY-1031','2024-06-17T08:44:00Z','Ava Taylor',      'ava.t@example.com',     [item('18','The Large','Navy Blue',1,445),item('4','The Check-In','Desert Sand',1,395)],     'shipped'),
  order('#VOY-1030','2024-06-16T16:30:00Z','Liam Anderson',   'liam.a@example.com',    [item('3','The Carry-On','Chalk White',1,295)],                                              'shipped'),
  order('#VOY-1029','2024-06-15T12:10:00Z','Mia Johnson',     'mia.j@example.com',     [item('7','The Large','Forest Green',1,445)],                                                'shipped'),
  order('#VOY-1028','2024-06-14T09:55:00Z','Benjamin Lee',    'ben.l@example.com',     [item('1','The Carry-On','Desert Sand',1,295),item('5','The Check-In','Slate Grey',1,395)],  'shipped'),
  order('#VOY-1027','2024-06-13T15:20:00Z','Amelia Scott',    'amelia.s@example.com',  [item('2','The Carry-On','Obsidian Black',1,295)],                                           'shipped'),
  order('#VOY-1026','2024-06-12T10:45:00Z','Henry Wilson',    'henry.w@example.com',   [item('18','The Large','Navy Blue',1,445)],                                                  'shipped'),
  order('#VOY-1025','2024-06-11T08:30:00Z','Harper Martinez', 'harper.m@example.com',  [item('4','The Check-In','Desert Sand',1,395),item('3','The Carry-On','Chalk White',1,295)], 'shipped'),
  order('#VOY-1024','2024-06-10T14:00:00Z','Sebastian Clark', 'seb.c@example.com',     [item('7','The Large','Forest Green',1,445)],                                                'shipped'),
  order('#VOY-1023','2024-06-09T11:15:00Z','Ella Robinson',   'ella.r@example.com',    [item('1','The Carry-On','Desert Sand',1,295)],                                              'shipped'),

  // ── Delivered (10) ──────────────────────────────────────
  order('#VOY-1022','2024-06-08T09:00:00Z','Jackson Lewis',   'jackson.l@example.com', [item('2','The Carry-On','Obsidian Black',1,295),item('18','The Large','Navy Blue',1,445)],  'delivered'),
  order('#VOY-1021','2024-06-07T15:30:00Z','Luna Walker',     'luna.w@example.com',    [item('5','The Check-In','Slate Grey',1,395)],                                               'delivered'),
  order('#VOY-1020','2024-06-06T12:45:00Z','Aiden Hall',      'aiden.h@example.com',   [item('7','The Large','Forest Green',1,445)],                                                'delivered'),
  order('#VOY-1019','2024-06-05T08:20:00Z','Scarlett Young',  'scarlett.y@example.com',[item('3','The Carry-On','Chalk White',1,295),item('4','The Check-In','Desert Sand',1,395)], 'delivered'),
  order('#VOY-1018','2024-06-04T14:10:00Z','Caleb Allen',     'caleb.a@example.com',   [item('1','The Carry-On','Desert Sand',1,295)],                                              'delivered'),
  order('#VOY-1017','2024-06-03T10:30:00Z','Victoria King',   'victoria.k@example.com',[item('18','The Large','Navy Blue',1,445)],                                                  'delivered'),
  order('#VOY-1016','2024-06-02T09:15:00Z','Mateo Wright',    'mateo.w@example.com',   [item('2','The Carry-On','Obsidian Black',1,295)],                                           'delivered'),
  order('#VOY-1015','2024-06-01T16:00:00Z','Aria Lopez',      'aria.l@example.com',    [item('5','The Check-In','Slate Grey',1,395),item('7','The Large','Forest Green',1,445)],    'delivered'),
  order('#VOY-1014','2024-05-31T11:30:00Z','Owen Hill',       'owen.h@example.com',    [item('3','The Carry-On','Chalk White',1,295)],                                              'delivered'),
  order('#VOY-1013','2024-05-30T08:45:00Z','Layla Green',     'layla.g@example.com',   [item('4','The Check-In','Desert Sand',1,395)],                                              'delivered'),

  // ── Returned (2) ────────────────────────────────────────
  order('#VOY-1012','2024-05-29T14:20:00Z','Ryan Adams',      'ryan.a@example.com',    [item('1','The Carry-On','Desert Sand',1,295)],                                              'returned'),
  order('#VOY-1011','2024-05-28T10:10:00Z','Zoe Baker',       'zoe.b@example.com',     [item('7','The Large','Forest Green',1,445)],                                                'returned'),
];

// ── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminOrderService {

  readonly orders = signal<AdminOrder[]>([...MOCK_ORDERS]);

  readonly totalCount      = computed(() => this.orders().length);
  readonly processingCount = computed(() => this.orders().filter(o => o.status === 'processing').length);
  readonly shippedCount    = computed(() => this.orders().filter(o => o.status === 'shipped').length);
  readonly deliveredCount  = computed(() => this.orders().filter(o => o.status === 'delivered').length);
  readonly returnedCount   = computed(() => this.orders().filter(o => o.status === 'returned').length);

  updateStatus(id: string, status: AdminOrderStatus): void {
    this.orders.update(os => os.map(o => o.id === id ? { ...o, status } : o));
  }
}