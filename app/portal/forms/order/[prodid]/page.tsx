"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FeatherBalance from "@/app/components/FeatherBalance";
import { orderProduct } from "@/app/forms/actions/orderProduct";
import { ShopItemData } from "@/app/components/ShopItem";

interface HackClubAddress {
  id: string;
  name: string;
  line_1: string;
  line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function OrderProductPage() {
  const params = useParams();
  const router = useRouter();
  const prodId = String(params.prodid);

  const [product, setProduct] = useState<ShopItemData | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<HackClubAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [quantity, setQuantity] = useState(1)
  const fetchAddresses = () => {
    setAddressesLoading(true);
    fetch("/api/user/addresses")
      .then((res) => res.json())
      .then((data) => {
        const addrs = data.addresses || [];
        setAddresses(addrs);
        if (addrs.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addrs[0].id);
        }
        setAddressesLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch addresses:", err);
        setAddressesLoading(false);
      });
  };

  useEffect(() => {
    const cachedBalance = sessionStorage.getItem("userBalance");
    if (cachedBalance) {
      setUserBalance(Number(cachedBalance));
    }

    fetch("/api/user/currency")
      .then((res) => res.json())
      .then((data) => {
        setUserBalance(data.balance);
        sessionStorage.setItem("userBalance", data.balance.toString());
      })
      .catch(console.error);

    fetch(`/api/shop/${prodId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(console.error);

    fetchAddresses();

    const handleFocus = () => {
      fetchAddresses();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [prodId]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const formatAddress = (addr: HackClubAddress) => {
    const parts = [
      addr.line_1,
      addr.line_2,
      addr.city,
      addr.state,
      addr.postal_code,
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleAddAddress = () => {
    window.open("https://auth.hackclub.com/addresses", "_blank");
  };

  const handleOrder = async () => {
    if (!product || submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("quantity", String(Math.max(1, quantity || 1)));
      const addressString = selectedAddress ? formatAddress(selectedAddress) : "";
      await orderProduct(formData, prodId, addressString);
      const newBalance = userBalance - product.price * quantity;
      sessionStorage.setItem("userBalance", newBalance.toString());

      router.push("/portal/shop");
    } catch (error) {
      console.error("Order failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div
          className="fixed inset-0 -z-20"
          style={{
            background: "linear-gradient(to bottom, #e6a4ab, #ffe2ea)",
          }}
        />
        <div
          className="fixed inset-0 -z-10 opacity-20"
          style={{
            backgroundImage: "url('/background/bunny-tile.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "210px",
          }}
        />
        <p
          className="text-[#7472a0] text-2xl font-bold"
          style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: "linear-gradient(to bottom, #e6a4ab, #ffe2ea)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: "url('/background/bunny-tile.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "210px",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-24 py-8 md:py-14">
        <div className="flex-1" />

        <Link
          href="/portal/shop"
          className="flex items-center gap-2 bg-gradient-to-b from-[#c0defe] to-[#9ac6f6] border-4 border-white rounded-2xl px-6 py-3 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)] hover:scale-105 transition-transform"
        >
          <span className="text-xl">←</span>
          <span
            className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-xl md:text-2xl font-bold"
            style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
          >
            Back to the Shop
          </span>
        </Link>

        <div className="flex-1 flex justify-end">
          <FeatherBalance balance={userBalance} />
        </div>
      </div>

      {/* Main Card */}
      <div className="px-6 md:px-24 pb-12">
        <div className="bg-gradient-to-b from-[#fff6e0] to-[#ffe8b2] border-4 border-white rounded-3xl shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)] p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Item Preview */}
            <div className="flex-1 bg-gradient-to-t from-[#fff2d4] to-[#ffe8b2] rounded-2xl shadow-[0px_4px_4px_0px_rgba(116,114,160,0.33)] p-4 md:p-6 flex flex-col">
              <div className="flex-1 bg-gradient-to-t from-[#ffe5a9] to-[#f9d588] rounded-2xl shadow-[0px_4px_4px_0px_rgba(116,114,160,0.33)] flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                {product?.image && (
                  <img
                    src={product.image}
                    alt={product?.name || "Product"}
                    className="max-w-[80%] max-h-[80%] object-contain"
                  />
                )}
              </div>

              <h2
                className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-4xl md:text-5xl font-bold mt-4"
                style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
              >
                {product?.name}
              </h2>

              <p
                className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-xl md:text-2xl font-bold mt-1"
                style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
              >
                {product?.description || "Item description"}
              </p>
            </div>

            {/* Right Side - Order Form */}
            <div className="flex-1 bg-gradient-to-t from-[#fff2d4] to-[#ffe8b2] rounded-2xl shadow-[0px_4px_4px_0px_rgba(116,114,160,0.33)] p-4 md:p-6 flex flex-col gap-4">
              <h3
                className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
              >
                Complete your order:
              </h3>

              {/* Shipping Address Dropdown */}
              <div className="w-full bg-gradient-to-b from-[#c0defe] to-[#9ac6f6] border-4 border-white rounded-2xl px-4 py-3 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)]">
                <p
                  className="text-[#7472a0] text-sm font-medium mb-2"
                  style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                >
                  Shipping Address:
                </p>
                {addressesLoading ? (
                  <p
                    className="text-[#7472a0] text-lg font-bold"
                    style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                  >
                    Loading addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <p
                    className="text-[#7472a0] text-lg font-bold"
                    style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                  >
                    No addresses on file
                  </p>
                ) : (
                  <>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full bg-white/80 border-2 border-[#c6c7e4] rounded-xl px-4 py-3 text-[#7472a0] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#7684c9]"
                      style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.name ? `${addr.name}: ` : ""}{formatAddress(addr)}
                        </option>
                      ))}
                    </select>
                    {selectedAddress && (
                      <p
                        className="mt-2 text-[#7472a0] text-sm"
                        style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                      >
                        {formatAddress(selectedAddress)}
                      </p>
                    )}
                  </>
                )}
              </div>
              {/* set quantity */}
                 <div className="w-full bg-gradient-to-b flex items-center from-[#c0defe] to-[#9ac6f6] border-4 border-white rounded-2xl px-3 py-2 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)]">
                
                <form className="px-3 md:px-4 py-2">
           
              <div className="mb-1 flex items-center gap-2">
              <label
                className="text-[20px] md:text-[24px] font-bold whitespace-nowrap"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "linear-gradient(180deg, #7685CB 0%, #7472A0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Quantity:
              </label>
              <input
                name="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  setQuantity(Number.isFinite(parsed) && parsed >= 1 ? parsed : 1);
                }}
                required
                className="w-20 rounded-[12px] px-3 py-1.5 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow:
                    "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
            </div>
            </form>
              </div>

              {/* Add New Address Button */}
              <button
                onClick={handleAddAddress}
                className="self-end bg-gradient-to-t from-[#d9daf8] to-[#b5aae7] border-4 border-white rounded-2xl px-6 py-2 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)] hover:scale-105 transition-transform"
              >
                <span
                  className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg font-bold"
                  style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                >
                  {addresses.length === 0 ? "Add Address" : "Manage Addresses"} ↗
                </span>
              </button>

              {/* Order Summary Section */}
              <div className="bg-gradient-to-b from-[#c0defe] to-[#9ac6f6] border-4 border-white rounded-2xl px-4 py-3 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)]">
                <span
                  className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-xl md:text-2xl font-bold"
                  style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                >
                  Order Summary
                </span>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-gradient-to-b from-[#ffffff] to-[#ebf5ff] border-4 border-white rounded-2xl shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)] p-4 flex flex-col gap-3">
                <div className="bg-gradient-to-t from-[#ffffff] to-[#ebf5ff] rounded-2xl shadow-[0px_4px_0px_0px_#c6c7e4] p-4 flex flex-col gap-3">
                  {/* Base Price */}
                  <div className="flex items-center justify-between">
                    <span
                      className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg md:text-xl font-bold"
                      style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                    >
                      Base Price:
                    </span>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/icons/feather.png"
                        alt="Feather"
                        width={24}
                        height={24}
                        className="rotate-[7deg]"
                      />
                      <span
                        className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg md:text-xl font-bold"
                        style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                      >
                        {product?.price}
                      </span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <span
                      className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg md:text-xl font-bold"
                      style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                    >
                      Quantity:
                    </span>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/icons/feather.png"
                        alt="Feather"
                        width={24}
                        height={24}
                        className="rotate-[7deg]"
                      />
                      <span
                        className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg md:text-xl font-bold"
                        style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                      >
                        x{quantity}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span
                      className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg md:text-xl font-bold"
                      style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                    >
                      Total:
                    </span>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/icons/feather.png"
                        alt="Feather"
                        width={24}
                        height={24}
                        className="rotate-[7deg]"
                      />
                      <span
                        className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg md:text-xl font-bold"
                        style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                      >
                        {product!.price * quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Button */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={handleOrder}
                  disabled={submitting || userBalance < (product!.price * quantity || 0) || addresses.length === 0}
                  className={`bg-gradient-to-t from-[#d9daf8] to-[#b5aae7] border-4 border-white rounded-2xl px-12 py-3 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)] transition-transform ${
                    submitting || userBalance < (product!.price * quantity || 0) || addresses.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                >
                  <span
                    className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-xl font-bold"
                    style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                  >
                    {submitting ? "Processing..." : addresses.length === 0 ? "Add Address First" : "Get!"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
