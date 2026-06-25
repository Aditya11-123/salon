"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Edit2, X, Check, Save, Plus } from 'lucide-react';

export interface Branch {
  id: string;
  name: string;
  address: string;
  timings: string;
}

export interface Staff {
  id: string;
  role: string;
  name: string;
  email: string;
}

// Mock API Call
const MOCK_STAFF: Record<string, Staff[]> = {
  'branch-1': [
    { id: 'u-1', role: 'barber', name: 'Mike Stylist', email: 'mike@elitecuts.com' },
    { id: 'u-2', role: 'manager', name: 'Sarah Connor', email: 'sarah@elitecuts.com' }
  ],
  'branch-2': [
    { id: 'u-3', role: 'barber', name: 'Tom Hardy', email: 'tom@elitecuts.com' }
  ]
};

interface BranchesListProps {
  salonId: string;
  branches: Branch[];
}

export default function BranchesList({ salonId, branches: initialBranches }: BranchesListProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Branch>>({});
  
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Branch>>({ name: '', address: '', timings: '' });

  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
  const [staffData, setStaffData] = useState<Record<string, Staff[]>>(MOCK_STAFF);

  const handleEditClick = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBranchId(branch.id);
    setEditForm(branch);
    setIsAddingBranch(false);
  };

  const handleSaveEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate PUT /admin/salons/:salonId/branches/:branchId
    setBranches(prev => prev.map(b => b.id === editingBranchId ? { ...b, ...editForm } as Branch : b));
    setEditingBranchId(null);
  };

  const handleAddClick = () => {
    setIsAddingBranch(true);
    setEditingBranchId(null);
    setAddForm({ name: '', address: '', timings: '' });
  };

  const handleSaveNewBranch = () => {
    if (!addForm.name || !addForm.address) return;
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name: addForm.name || '',
      address: addForm.address || '',
      timings: addForm.timings || ''
    };
    setBranches([newBranch, ...branches]);
    setIsAddingBranch(false);
  };

  const toggleBranch = (branchId: string) => {
    if (editingBranchId) return; 
    
    if (expandedBranchId === branchId) {
      setExpandedBranchId(null);
    } else {
      setExpandedBranchId(branchId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Physical Branches</h3>
        <button 
          onClick={handleAddClick}
          disabled={isAddingBranch}
          className="text-sm bg-[#1877f2]/10 text-[#1877f2] px-4 py-2 rounded-full hover:bg-[#1877f2]/20 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {isAddingBranch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-[#1877f2] bg-[#f0f2f5] shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">New Branch Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    value={addForm.name} 
                    onChange={e => setAddForm({...addForm, name: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1877f2] focus:ring-[#1877f2] text-sm px-3 py-2.5 border" 
                    placeholder="Branch Name"
                  />
                  <input 
                    type="text" 
                    value={addForm.address} 
                    onChange={e => setAddForm({...addForm, address: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1877f2] focus:ring-[#1877f2] text-sm px-3 py-2.5 border" 
                    placeholder="Address"
                  />
                  <input 
                    type="text" 
                    value={addForm.timings} 
                    onChange={e => setAddForm({...addForm, timings: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1877f2] focus:ring-[#1877f2] text-sm px-3 py-2.5 border" 
                    placeholder="Timings (e.g. 9 AM - 8 PM)"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    onClick={() => setIsAddingBranch(false)} 
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveNewBranch} 
                    className="px-4 py-2 text-sm text-white bg-[#1877f2] rounded-lg hover:bg-[#166fe5] transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save Branch
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {branches.map((branch, index) => {
          const isEditing = editingBranchId === branch.id;
          const isExpanded = expandedBranchId === branch.id;
          const staff = staffData[branch.id] || [];

          return (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border ${isExpanded ? 'border-[#1877f2] ring-1 ring-[#1877f2]' : 'border-gray-200'} bg-white shadow-sm overflow-hidden transition-all`}
            >
              <div 
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 ${isExpanded ? 'bg-[#1877f2]/5' : ''}`}
                onClick={() => toggleBranch(branch.id)}
              >
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3" onClick={e => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1877f2] focus:ring-[#1877f2] text-sm px-3 py-2.5 border" 
                      placeholder="Branch Name"
                    />
                    <input 
                      type="text" 
                      value={editForm.address} 
                      onChange={e => setEditForm({...editForm, address: e.target.value})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1877f2] focus:ring-[#1877f2] text-sm px-3 py-2.5 border" 
                      placeholder="Address"
                    />
                    <input 
                      type="text" 
                      value={editForm.timings} 
                      onChange={e => setEditForm({...editForm, timings: e.target.value})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1877f2] focus:ring-[#1877f2] text-sm px-3 py-2.5 border" 
                      placeholder="Timings"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">{branch.name}</h4>
                      <p className="text-sm text-gray-500 flex items-start sm:items-center gap-1.5 mt-1.5 leading-snug">
                        <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5 sm:mt-0" /> {branch.address}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1.5 mt-2 sm:mt-0 bg-gray-50 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-gray-100">
                      <Clock className="h-4 w-4 text-[#1877f2]" /> {branch.timings}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0 sm:ml-4 border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                  {isEditing ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setEditingBranchId(null); }} className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-1 sm:flex-none flex justify-center">
                        <X className="h-4 w-4" />
                      </button>
                      <button onClick={handleSaveEditClick} className="p-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex-1 sm:flex-none flex justify-center">
                        <Save className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 bg-[#f0f2f5] rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#1877f2]" />
                        {staff.length} Staff
                      </div>
                      <button onClick={(e) => handleEditClick(branch, e)} className="p-2 text-gray-400 hover:text-[#1877f2] hover:bg-blue-50 rounded-full transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && !isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-[#f0f2f5]/50"
                  >
                    <div className="p-4 sm:p-5">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Branch Staff Members</h5>
                      {staff.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          {staff.map(member => (
                            <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center font-bold text-sm">
                                {member.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{member.name}</p>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide truncate mt-0.5">{member.role} • {member.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No staff assigned to this branch yet.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
