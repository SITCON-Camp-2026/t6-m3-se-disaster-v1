import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: "文具" | "飲品" | "點心" | "用品" | "3C";
  price: number;
  stock: number;
  note: string;
};

const paymentMethods = [
  "Apple Pay",
  "Samsung Pay",
  "LINE Pay",
  "Google Pay",
] as const;

type PaymentMethod = (typeof paymentMethods)[number];

const products: Product[] = [
  {
    id: "shop-pen",
    name: "透明筆記組",
    category: "文具",
    price: 120,
    stock: 8,
    note: "適合課堂速記與分組討論。",
  },
  {
    id: "shop-sticky-notes",
    name: "柔色便利貼",
    category: "文具",
    price: 65,
    stock: 18,
    note: "低飽和色票，適合標記流程與待確認事項。",
  },
  {
    id: "shop-marker",
    name: "雙頭標記筆",
    category: "文具",
    price: 95,
    stock: 10,
    note: "可用於白板、草稿紙與小組討論標示。",
  },
  {
    id: "shop-folder",
    name: "霧面資料夾",
    category: "文具",
    price: 80,
    stock: 14,
    note: "收納講義、觀察紀錄與流程草稿。",
  },
  {
    id: "shop-bottle",
    name: "輕量水壺",
    category: "飲品",
    price: 260,
    stock: 5,
    note: "可重複使用，方便活動中補水。",
  },
  {
    id: "shop-tea",
    name: "冷泡茶包",
    category: "飲品",
    price: 90,
    stock: 16,
    note: "清爽茶香，適合長時間討論時補充水分。",
  },
  {
    id: "shop-coffee",
    name: "濾掛咖啡",
    category: "飲品",
    price: 140,
    stock: 9,
    note: "小包裝咖啡，適合早晨或下午整理資料時使用。",
  },
  {
    id: "shop-cocoa",
    name: "可可飲包",
    category: "飲品",
    price: 110,
    stock: 11,
    note: "溫熱甜飲，適合休息時間放鬆一下。",
  },
  {
    id: "shop-cookie",
    name: "燕麥點心包",
    category: "點心",
    price: 75,
    stock: 12,
    note: "小份量點心，適合休息時間分享。",
  },
  {
    id: "shop-nuts",
    name: "堅果小包",
    category: "點心",
    price: 95,
    stock: 13,
    note: "方便攜帶，適合作為分組討論間的小補給。",
  },
  {
    id: "shop-rice-cracker",
    name: "米香脆片",
    category: "點心",
    price: 60,
    stock: 15,
    note: "輕脆口感，適合不想吃太甜的休息時間。",
  },
  {
    id: "shop-fruit-bar",
    name: "果乾能量棒",
    category: "點心",
    price: 85,
    stock: 10,
    note: "小份量補充，適合活動中快速墊胃。",
  },
  {
    id: "shop-tote",
    name: "帆布收納袋",
    category: "用品",
    price: 180,
    stock: 6,
    note: "可放講義、筆電配件與個人物品。",
  },
  {
    id: "shop-lanyard",
    name: "識別證掛繩",
    category: "用品",
    price: 70,
    stock: 20,
    note: "協助辨識小組與活動用品，方便重複使用。",
  },
  {
    id: "shop-cable-pouch",
    name: "線材收納包",
    category: "用品",
    price: 150,
    stock: 7,
    note: "整理充電線、轉接頭與小型配件。",
  },
  {
    id: "shop-desk-mat",
    name: "摺疊桌墊",
    category: "用品",
    price: 210,
    stock: 5,
    note: "讓臨時工作區更穩定，也方便收納帶走。",
  },
  {
    id: "shop-iphone",
    name: "iPhone",
    category: "3C",
    price: 29900,
    stock: 4,
    note: "示範用手機商品，不代表真實規格或售價。",
  },
  {
    id: "shop-samsung-s27-ultra",
    name: "Samsung S27 Ultra",
    category: "3C",
    price: 36900,
    stock: 3,
    note: "示範用旗艦手機商品，僅供前端購物流程展示。",
  },
  {
    id: "shop-pixel",
    name: "Google Pixel",
    category: "3C",
    price: 24900,
    stock: 5,
    note: "示範用 Android 手機商品，不連外部商品資料。",
  },
  {
    id: "shop-ipad",
    name: "iPad",
    category: "3C",
    price: 17900,
    stock: 6,
    note: "適合展示平板類商品的購物車互動。",
  },
  {
    id: "shop-macbook-air",
    name: "MacBook Air",
    category: "3C",
    price: 35900,
    stock: 2,
    note: "示範用筆電商品，價格與庫存皆為假資料。",
  },
  {
    id: "shop-airpods-pro",
    name: "AirPods Pro",
    category: "3C",
    price: 7490,
    stock: 8,
    note: "示範用耳機商品，可測試加入購物車與數量調整。",
  },
  {
    id: "shop-galaxy-watch",
    name: "Galaxy Watch",
    category: "3C",
    price: 9900,
    stock: 7,
    note: "示範用穿戴裝置商品，未連接真實庫存。",
  },
  {
    id: "shop-usb-c-charger",
    name: "USB-C 快充組",
    category: "3C",
    price: 1290,
    stock: 12,
    note: "示範用配件商品，適合測試低單價 3C 商品。",
  },
];

const categories = ["全部", "文具", "飲品", "點心", "用品", "3C"] as const;

type CategoryFilter = (typeof categories)[number];
type Cart = Record<string, number>;

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
});

function formatPrice(price: number) {
  return currencyFormatter.format(price);
}

export function ShoppingPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("全部");
  const [cart, setCart] = useState<Cart>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Apple Pay");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "全部") {
      return products;
    }

    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartItems = products
    .map((product) => ({
      product,
      quantity: cart[product.id] ?? 0,
    }))
    .filter((item) => item.quantity > 0);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const currentQuantity = currentCart[product.id] ?? 0;

      if (currentQuantity >= product.stock) {
        return currentCart;
      }

      return {
        ...currentCart,
        [product.id]: currentQuantity + 1,
      };
    });
  }

  function removeFromCart(productId: string) {
    setCart((currentCart) => {
      const currentQuantity = currentCart[productId] ?? 0;

      if (currentQuantity <= 1) {
        const nextCart = { ...currentCart };
        delete nextCart[productId];
        return nextCart;
      }

      return {
        ...currentCart,
        [productId]: currentQuantity - 1,
      };
    });
  }

  return (
    <div className="shopping-page">
      <section
        className="shopping-page__intro"
        aria-labelledby="shopping-title"
      >
        <div>
          <p className="shopping-page__label">前端示範頁</p>
          <h2 id="shopping-title">購物頁面</h2>
          <p>
            這是一個不連外部服務的假資料購物頁，可試著篩選商品、加入購物車與調整數量。
          </p>
        </div>
        <div className="shopping-page__summary" aria-label="購物車摘要">
          <span>{totalQuantity} 件商品</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>
      </section>

      <div className="shopping-page__layout">
        <section aria-labelledby="product-list-title">
          <div className="shopping-page__toolbar">
            <h3 id="product-list-title">商品列表</h3>
            <div className="shopping-page__filters" aria-label="商品分類">
              {categories.map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="shopping-products">
            {filteredProducts.map((product) => {
              const quantity = cart[product.id] ?? 0;
              const isSoldOut = quantity >= product.stock;

              return (
                <article className="shopping-product" key={product.id}>
                  <div>
                    <span className="shopping-product__category">
                      {product.category}
                    </span>
                    <h4>{product.name}</h4>
                    <p>{product.note}</p>
                  </div>

                  <div className="shopping-product__footer">
                    <div>
                      <strong>{formatPrice(product.price)}</strong>
                      <span>庫存 {product.stock - quantity}</span>
                    </div>
                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => addToCart(product)}
                    >
                      + 加入
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="shopping-cart" aria-labelledby="cart-title">
          <div className="shopping-cart__header">
            <h3 id="cart-title">購物車</h3>
            <button type="button" onClick={() => setCart({})}>
              x 清空
            </button>
          </div>

          <section className="shopping-payment" aria-label="付款方式">
            <h4>付款方式</h4>
            <div className="shopping-payment__options">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={selectedPaymentMethod === method ? "active" : ""}
                  type="button"
                  aria-pressed={selectedPaymentMethod === method}
                  onClick={() => setSelectedPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </section>

          {cartItems.length === 0 ? (
            <p className="shopping-cart__empty">目前尚未加入商品。</p>
          ) : (
            <ul className="shopping-cart__items">
              {cartItems.map(({ product, quantity }) => (
                <li key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {formatPrice(product.price)} x {quantity}
                    </span>
                  </div>
                  <div className="shopping-cart__actions">
                    <button
                      type="button"
                      aria-label={`減少 ${product.name}`}
                      onClick={() => removeFromCart(product.id)}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      aria-label={`增加 ${product.name}`}
                      disabled={quantity >= product.stock}
                      onClick={() => addToCart(product)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <dl className="shopping-cart__total">
            <div>
              <dt>商品數量</dt>
              <dd>{totalQuantity}</dd>
            </div>
            <div>
              <dt>小計</dt>
              <dd>{formatPrice(totalPrice)}</dd>
            </div>
            <div>
              <dt>付款方式</dt>
              <dd>{selectedPaymentMethod}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
