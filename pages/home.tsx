import Head from "next/head";
import dynamic from "next/dynamic";
import { config } from "@/utils/config";
import { useAppContext } from "@/utils/context";
import { currencies } from "@/utils/currencies";
import { rainbowKitConfig as wagmiConfig } from "@/utils/wagmiConfig";
import { Spinner } from "@/components/ui";
import { useState, useEffect } from "react";
import { Types } from "@requestnetwork/request-client.js";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import axios from "axios";

const InvoiceDashboard = dynamic(
  () => {
    // Ensure web component is loaded only once in the client
    if (
      typeof window !== "undefined" &&
      !customElements.get("invoice-dashboard")
    ) {
      require("@requestnetwork/invoice-dashboard");
    }
    return import("@requestnetwork/invoice-dashboard/react");
  },
  { ssr: false, loading: () => <Spinner /> }
);
export default function InvoiceDashboardPage() {
  const { requestNetwork } = useAppContext();
  const { address } = useAccount();
  const [totalExpectedAmount, setTotalExpectedAmount] = useState<string>("0");
  const [totalReceivedAmount, setTotalReceivedAmount] = useState<string>("0");
  const [requestCount, setRequestCount] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(0);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Primary endpoint
        const response = await axios.get(
          "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
        );
        setEthPrice(response.data.USD);
      } catch (error) {
        // Fallback to a default value
        setEthPrice(3000); // Default ETH price as fallback
        console.log("Using default ETH price due to API limitation");
      }
    };

    fetchEthPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchEthPrice, 300000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchTotalAmount = async () => {
      if (!requestNetwork || !address) return;

      try {
        const requests = await requestNetwork.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: address,
        });

        setRequestCount(requests.length);

        const { expectedTotal, receivedTotal } = requests.reduce(
          (acc, request) => {
            const data = request.getData();
            return {
              expectedTotal:
                acc.expectedTotal + BigInt(data.expectedAmount || 0),
              receivedTotal:
                acc.receivedTotal + BigInt(data.balance?.balance || 0),
            };
          },
          { expectedTotal: BigInt(0), receivedTotal: BigInt(0) }
        );

        setTotalExpectedAmount(formatUnits(expectedTotal, 18));
        setTotalReceivedAmount(formatUnits(receivedTotal, 18));
      } catch (error) {
        console.error("Failed to fetch amounts:", error);
      }
    };

    fetchTotalAmount();
  }, [requestNetwork, address]);

  const formatUSD = (ethAmount: string) => {
    const usdAmount = parseFloat(ethAmount) * ethPrice;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(usdAmount);
  };

  return (
    <>
      <Head>
        <title>HireFree</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Dashboard Overview
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Expected
                  </p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {totalExpectedAmount} ETH
                  </p>
                  <p className="text-lg text-blue-400">
                    {formatUSD(totalExpectedAmount)}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Received
                  </p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {totalReceivedAmount} ETH
                  </p>
                  <p className="text-lg text-green-400">
                    {formatUSD(totalReceivedAmount)}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Requests
                  </p>
                  <p className="mt-2 text-3xl font-bold text-purple-600">
                    {requestCount}
                  </p>
                  <p className="text-lg text-purple-400">Total Invoices</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <InvoiceDashboard
              config={config}
              currencies={currencies}
              requestNetwork={requestNetwork}
              wagmiConfig={wagmiConfig}
            />
          </div>
        </div>
      </div>
    </>
  );
}
