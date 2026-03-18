import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Truck, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DeliveryStatus {
  id: string;
  order_id: string;
  status: number;
  status_name: string;
  notes: string;
  created_at: string;
}

interface OrderInfo {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
}

const ShippingInfoPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>([]);

  const formatOrderId = (orderId: string) => {
    const shortId = orderId.split('-').pop() || orderId;
    return `RKIN-${shortId}`;
  };

  const parseOrderId = (displayId: string) => {
    if (displayId.startsWith('RKIN-')) {
      return displayId.replace('RKIN-', '');
    }
    return displayId;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setLoading(true);
    try {
      const searchId = parseOrderId(orderNumber.trim());
      
      // Search for order by partial ID match
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', `%${searchId}%`)
        .limit(1);

      if (orderError) throw orderError;

      if (!orders || orders.length === 0) {
        toast.error('Order not found. Please check your order number.');
        setOrderInfo(null);
        setDeliveryStatuses([]);
        return;
      }

      const order = orders[0];
      setOrderInfo(order);

      // Fetch delivery tracking information
      const { data: tracking, error: trackingError } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (trackingError) throw trackingError;

      setDeliveryStatuses(tracking || []);
      toast.success('Order found successfully!');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
      case 2:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 3:
      case 4:
      case 5:
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 6:
      case 7:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
      case 4:
      case 5:
        return 'bg-blue-100 text-blue-800';
      case 6:
      case 7:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const shippingInfo = [
    {
      title: 'Processing Time',
      description: 'Orders are typically processed within 1-2 business days.',
      icon: <Clock className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Shipping Methods',
      description: 'We offer standard (3-5 days) and express (1-2 days) shipping options.',
      icon: <Truck className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Tracking',
      description: 'Track your order in real-time with our delivery tracking system.',
      icon: <Package className="h-6 w-6 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-xl text-gray-600">
            Track your order and learn about our shipping process
          </p>
        </div>

        {/* Order Tracking Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Search className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Track Your Order</h2>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., RKIN-e177e3eaa544)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Track
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Order Information */}
          {orderInfo && (
            <div className="border-t pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {formatOrderId(orderInfo.id)}</p>
                    <p><span className="font-medium">Total Amount:</span> ₹{orderInfo.total_amount}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        orderInfo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        orderInfo.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {orderInfo.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Order Date:</span> {new Date(orderInfo.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-gray-600">
                    <p>{orderInfo.shipping_address?.name}</p>
                    <p>{orderInfo.shipping_address?.address_line_1}</p>
                    {orderInfo.shipping_address?.address_line_2 && (
                      <p>{orderInfo.shipping_address.address_line_2}</p>
                    )}
                    <p>{orderInfo.shipping_address?.area}, {orderInfo.shipping_address?.city}</p>
                    <p>{orderInfo.shipping_address?.state_province} - {orderInfo.shipping_address?.postal_code}</p>
                    <p>{orderInfo.shipping_address?.country}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Timeline */}
              {deliveryStatuses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Timeline</h3>
                  <div className="space-y-4">
                    {deliveryStatuses.map((status, index) => (
                      <div key={status.id} className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          {getStatusIcon(status.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{status.status_name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                              Status {status.status}
                            </span>
                          </div>
                          {status.notes && (
                            <p className="text-gray-600 text-sm mt-1">{status.notes}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(status.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shipping Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {shippingInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                {info.icon}
                <h3 className="text-lg font-semibold text-gray-900 ml-3">{info.title}</h3>
              </div>
              <p className="text-gray-600">{info.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Process</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Processing</h3>
              <p className="text-gray-600">
                Once you place an order, we begin processing it immediately. Our team carefully picks and packs your items to ensure they arrive in perfect condition.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Partners</h3>
              <p className="text-gray-600">
                We work with trusted shipping partners including Shiprocket to ensure reliable and timely delivery of your orders across India.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Timeframes</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Standard Delivery: 3-5 business days</li>
                <li>• Express Delivery: 1-2 business days</li>
                <li>• Same Day Delivery: Available in select cities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfoPage;