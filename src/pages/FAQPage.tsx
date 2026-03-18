import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Circle as HelpCircle } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various methods including credit/debit cards, UPI, or choose Cash on Delivery.',
      category: 'ordering'
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards, UPI payments, net banking, and Cash on Delivery (COD) for eligible orders.',
      category: 'payment'
    },
    {
      id: 3,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. Same-day delivery is available in select cities.',
      category: 'shipping'
    },
    {
      id: 4,
      question: 'Can I track my order?',
      answer: 'Yes! Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track your order on our Shipping Info page.',
      category: 'shipping'
    },
    {
      id: 5,
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for most items. Products must be in original condition with tags attached. Visit our Returns & Exchanges page to initiate a return.',
      category: 'returns'
    },
    {
      id: 6,
      question: 'How do I return an item?',
      answer: 'To return an item, go to our Returns & Exchanges page, enter your order number, select the reason for return, and submit the request. We\'ll guide you through the process.',
      category: 'returns'
    },
    {
      id: 7,
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.',
      category: 'returns'
    },
    {
      id: 8,
      question: 'Do you offer Cash on Delivery?',
      answer: 'Yes, we offer Cash on Delivery (COD) for orders across India. COD charges may apply based on your location and order value.',
      category: 'payment'
    },
    {
      id: 9,
      question: 'How can I change or cancel my order?',
      answer: 'You can change or cancel your order within 1 hour of placing it. Contact our customer support immediately or visit your account dashboard.',
      category: 'ordering'
    },
    {
      id: 10,
      question: 'Are your products authentic?',
      answer: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors and manufacturers.',
      category: 'products'
    },
    {
      id: 11,
      question: 'Do you have a mobile app?',
      answer: 'Currently, we operate through our website. However, our website is mobile-optimized for the best shopping experience on your phone.',
      category: 'general'
    },
    {
      id: 12,
      question: 'How can I contact customer support?',
      answer: 'You can reach our customer support through the Contact Us page, email us at support@rkinfotech.com, or call us at +91 98765 43210.',
      category: 'general'
    },
    {
      id: 13,
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within India. International shipping may be available in the future.',
      category: 'shipping'
    },
    {
      id: 14,
      question: 'What if I receive a damaged product?',
      answer: 'If you receive a damaged product, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or full refund.',
      category: 'products'
    },
    {
      id: 15,
      question: 'Can I modify my shipping address?',
      answer: 'You can modify your shipping address within 1 hour of placing the order. After that, please contact customer support for assistance.',
      category: 'shipping'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ordering', label: 'Ordering' },
    { value: 'payment', label: 'Payment' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'products', label: 'Products' },
    { value: 'general', label: 'General' }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our products and services
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {faq.question}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full capitalize">
                      {faq.category}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 border-t border-gray-100">
                        <p className="text-gray-600 pt-4 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 mt-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-green-100 mb-6">
            Can't find what you're looking for? Our customer support team is here to help!
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Contact Support
          </motion.a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;