export const priceFormat = (price: string | number | undefined) => {
  if (typeof price === "string") {
    price = parseFloat(price);
  }
  return price != undefined && !isNaN(price)
    ? price
        .toLocaleString("zh-CN", {
          style: "currency",
          currency: "CNY",
        })
        .replace("-¥", "¥-")
    : "--";
};
