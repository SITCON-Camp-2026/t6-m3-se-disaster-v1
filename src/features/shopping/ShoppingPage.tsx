import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: "文具" | "飲品" | "點心" | "用品";
  price: number;
  stock: number;
  note: string;
};

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
    id: "shop-bottle",
    name: "輕量水壺",
    category: "飲品",
    price: 260,
    stock: 5,
    note: "可重複使用，方便活動中補水。",
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
    id: "shop-tote",
    name: "帆布收納袋",
    category: "用品",
    price: 180,
    stock: 6,
    note: "可放講義、筆電配件與個人物品。",
  },
];

const categories = ["全部", "文具", "飲品", "點心", "用品"] as const;

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
          </dl>
        </aside>
      </div>
    </div>
  );
}
