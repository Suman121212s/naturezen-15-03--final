import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Search, Calendar, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

interface OrderInfo {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: any[];
}

const ReturnsPage: React.FC = () => {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [returnForm, setReturnForm] = useState({
    reason: '',
    comment: '',
  });

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

    if (!user) {
      toast.error('Please login to search for orders');
      return;
    }

    setLoading(true);
    try {
      const searchId = parseOrderId(orderNumber.trim());
      
      // Search for order by partial ID match and user
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .ilike('id', `%${searchId}%`)
        .limit(1);

      if (orderError) throw orderError;

      if (!orders || orders.length === 0) {
        toast.error('Order not found or does not belong to you.');
        setOrderInfo(null);
        return;
      }

      const order = orders[0];
      
      // Check if order is eligible for return (within 7 days)
      const orderDate = new Date(order.created_at);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDifference > 7) {
        toast.error('This order is not eligible for return. Return period has expired (7 days).');
        setOrderInfo(null);
        return;
      }

      setOrderInfo(order);
      toast.success('Order found and eligible for return!');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setReturnForm({
      ...returnForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderInfo || !user) return;

    if (!returnForm.reason) {
      toast.error('Please select a reason for return');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('order_returns')
        .insert([{
          order_id: orderInfo.id,
          user_id: user.id,
          reason: returnForm.reason,
          comment: returnForm.comment,
          status: 'pending',
        }]);

      if (error) throw error;

      toast.success('Return request submitted successfully! We will contact you soon.');
      setReturnForm({ reason: '', comment: '' });
      setOrderInfo(null);
      setOrderNumber('');
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const returnReasons = [
    'Defective/Damaged Product',
    'Wrong Item Received',
    'Size/Fit Issues',
    'Not as Described',
    'Quality Issues',
    'Changed Mind',
    'Other',
  ];

  const returnPolicies = [
    {
      title: '7-Day Return Policy',
      description: 'Items can be returned within 7 days of delivery for a full refund.',
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Original Condition',
      description: 'Items must be in original condition with tags and packaging intact.',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Quality Assurance',
      description: 'We inspect all returned items to ensure they meet our quality standards.',
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Exchanges</h1>
          <p className="text-xl text-gray-600">
            Easy returns within 7 days of delivery
          </p>
        </div>

        {/* Return Request Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <RotateCcw className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Request a Return</h2>
          </div>

          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">Please login to request a return.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., RKIN-e177e3eaa544)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading || !user}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !user}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Order Information and Return Form */}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Eligibility</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-green-800 font-medium">Eligible for Return</p>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      This order is within the 7-day return window.
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Form */}
              <form onSubmit={handleSubmitReturn} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Return *
                  </label>
                  <select
                    name="reason"
                    value={returnForm.reason}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={submitting}
                  >
                    <option value="">Select a reason</option>
                    {returnReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    name="comment"
                    value={returnForm.comment}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Please provide additional details about your return request..."
                    disabled={submitting}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {returnForm.comment.length}/500 characters
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Submit Return Request
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          )}
        </div>

        {/* Return Policy Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {returnPolicies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                {policy.icon}
                <h3 className="text-lg font-semibold text-gray-900 ml-3">{policy.title}</h3>
              </div>
              <p className="text-gray-600">{policy.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Return Policy */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Policy Details</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eligible Items</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Items must be returned within 7 days of delivery</li>
                <li>• Products must be in original condition with tags attached</li>
                <li>• Original packaging must be intact</li>
                <li>• Items should be unused and unwashed</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Process</h3>
              <ol className="text-gray-600 space-y-1">
                <li>1. Submit a return request using the form above</li>
                <li>2. Our team will review your request within 24 hours</li>
                <li>3. If approved, we'll provide return shipping instructions</li>
                <li>4. Pack the item securely and ship it back to us</li>
                <li>5. Refund will be processed within 5-7 business days after we receive the item</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Refund Information</h3>
              <p className="text-gray-600">
                Refunds will be processed to the original payment method. For COD orders, refunds will be processed via bank transfer or UPI. Processing time may vary depending on your bank or payment provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;