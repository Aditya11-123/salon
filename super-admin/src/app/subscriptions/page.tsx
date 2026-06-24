"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  barberLimit: number;
  aiLimit: number;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subscription>>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState<any>({
    name: '', monthlyPrice: '', quarterlyPrice: '', annualPrice: '', barberLimit: '', aiLimit: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/subscriptions');
      setPlans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions. (Backend may be unreachable or unauthorized)');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (plan: Subscription) => {
    setEditingId(plan.id);
    setEditForm({ ...plan });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    try {
      await fetchWithAuth(`/admin/subscriptions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      loadPlans();
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await fetchWithAuth(`/admin/subscriptions/${id}`, { method: 'DELETE' });
      loadPlans();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          ...newPlanForm,
          monthlyPrice: Number(newPlanForm.monthlyPrice) || 0,
          quarterlyPrice: Number(newPlanForm.quarterlyPrice) || 0,
          annualPrice: Number(newPlanForm.annualPrice) || 0,
          barberLimit: Number(newPlanForm.barberLimit) || 0,
          aiLimit: Number(newPlanForm.aiLimit) || 0,
        }),
      });
      setIsAddingModalOpen(false);
      setNewPlanForm({ name: '', monthlyPrice: '', quarterlyPrice: '', annualPrice: '', barberLimit: '', aiLimit: '' });
      loadPlans();
    } catch (err: any) {
      alert(`Failed to create plan: ${err.message}`);
    }
  };

  const seedPlans = async () => {
    try {
      await fetchWithAuth('/admin/subscriptions/seed', { method: 'POST' });
      loadPlans();
    } catch (err: any) {
      alert(`Failed to seed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading plans...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Manage platform pricing and tier limits.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {plans.length === 0 && (
            <button onClick={seedPlans} className="w-full sm:w-auto cursor-pointer bg-[#1877f2] text-white px-4 py-2.5 rounded-full hover:bg-[#166fe5] transition font-semibold text-sm shadow-sm">
              Seed Default Plans
            </button>
          )}
          <button onClick={() => setIsAddingModalOpen(true)} className="w-full sm:w-auto cursor-pointer bg-gray-900 text-white px-4 py-2.5 rounded-full hover:bg-gray-800 transition flex justify-center items-center font-semibold text-sm shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Custom Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-100">
          {error}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="bg-white border border-gray-200 p-1 rounded-full flex items-center shadow-sm max-w-full overflow-x-auto no-scrollbar">
          {['monthly', 'quarterly', 'annual'].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle as any)}
              className={`cursor-pointer capitalize px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                billingCycle === cycle ? 'bg-[#1877f2] shadow-sm text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          const displayPrice = billingCycle === 'monthly' ? plan.monthlyPrice : billingCycle === 'quarterly' ? plan.quarterlyPrice : plan.annualPrice;

          return (
            <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative group">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  {!isEditing && (
                    <div className="flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(plan)} className="cursor-pointer p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-[#1877f2]"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(plan.id)} className="cursor-pointer p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-extrabold tracking-tight">₹{displayPrice}</span>
                    <span className="ml-1 text-sm font-medium text-gray-500">/{billingCycle === 'monthly' ? 'mo' : billingCycle === 'quarterly' ? 'qtr' : 'yr'}</span>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Monthly ₹</label>
                      <input type="number" placeholder="0" value={editForm.monthlyPrice ?? ''} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setEditForm({...editForm, monthlyPrice: e.target.value === '' ? ('' as any) : Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none transition" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quarterly ₹</label>
                      <input type="number" placeholder="0" value={editForm.quarterlyPrice ?? ''} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setEditForm({...editForm, quarterlyPrice: e.target.value === '' ? ('' as any) : Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none transition" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Annual ₹</label>
                      <input type="number" placeholder="0" value={editForm.annualPrice ?? ''} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setEditForm({...editForm, annualPrice: e.target.value === '' ? ('' as any) : Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none transition" />
                    </div>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-grow">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                    {!isEditing ? (
                      <span className="text-gray-600">{plan.barberLimit > 90000 ? 'Unlimited' : plan.barberLimit} Barbers</span>
                    ) : (
                      <div className="flex items-center space-x-2 w-full">
                        <span className="text-gray-600 text-sm">Barbers:</span>
                        <input type="number" placeholder="0" value={editForm.barberLimit ?? ''} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setEditForm({...editForm, barberLimit: e.target.value === '' ? ('' as any) : Number(e.target.value)})} className="w-full p-1 border border-gray-300 rounded text-sm" />
                      </div>
                    )}
                  </li>
                  <li className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                    {!isEditing ? (
                      <span className="text-gray-600">{plan.aiLimit > 90000 ? 'Unlimited' : plan.aiLimit} AI Consultations</span>
                    ) : (
                      <div className="flex items-center space-x-2 w-full">
                        <span className="text-gray-600 text-sm">AI Limit:</span>
                        <input type="number" placeholder="0" value={editForm.aiLimit ?? ''} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setEditForm({...editForm, aiLimit: e.target.value === '' ? ('' as any) : Number(e.target.value)})} className="w-full p-1 border border-gray-300 rounded text-sm" />
                      </div>
                    )}
                  </li>
                </ul>
              </div>

              {/* Actions */}
              {isEditing && (
                <div className="p-4 bg-gray-50 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 border-t border-gray-100">
                  <button onClick={() => handleSave(plan.id)} className="cursor-pointer flex-1 bg-[#1877f2] text-white py-2 rounded-lg font-medium flex justify-center items-center hover:bg-[#166fe5] transition shadow-sm">
                    <Save className="w-4 h-4 mr-2" /> Save
                  </button>
                  <button onClick={handleCancelEdit} className="cursor-pointer flex-1 bg-white border border-gray-200 text-gray-800 py-2 rounded-lg font-medium flex justify-center items-center hover:bg-gray-50 transition shadow-sm">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Plan Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sticky top-0 bg-white border-b border-gray-100 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Add Custom Plan</h3>
              <button onClick={() => setIsAddingModalOpen(false)} className="cursor-pointer p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plan Name</label>
                <input required type="text" value={newPlanForm.name} onChange={e => setNewPlanForm({...newPlanForm, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none" placeholder="e.g. VIP Plan" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly ₹</label>
                  <input required type="number" min="0" placeholder="0" value={newPlanForm.monthlyPrice} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setNewPlanForm({...newPlanForm, monthlyPrice: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quarterly ₹</label>
                  <input required type="number" min="0" placeholder="0" value={newPlanForm.quarterlyPrice} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setNewPlanForm({...newPlanForm, quarterlyPrice: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Annual ₹</label>
                  <input required type="number" min="0" placeholder="0" value={newPlanForm.annualPrice} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setNewPlanForm({...newPlanForm, annualPrice: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Barber Limit</label>
                  <input required type="number" min="0" placeholder="0" value={newPlanForm.barberLimit} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setNewPlanForm({...newPlanForm, barberLimit: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">AI Consultations</label>
                  <input required type="number" min="0" placeholder="0" value={newPlanForm.aiLimit} onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }} onChange={e => setNewPlanForm({...newPlanForm, aiLimit: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2] outline-none" />
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button type="button" onClick={() => setIsAddingModalOpen(false)} className="cursor-pointer w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition font-semibold">Cancel</button>
                <button type="submit" className="cursor-pointer w-full sm:w-auto px-5 py-2.5 text-white bg-[#1877f2] rounded-full hover:bg-[#166fe5] shadow-sm transition font-semibold">Create Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
