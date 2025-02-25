import React, { useState } from 'react';
import DonationCard from '../common/DonationCard';
import SkeletonCard from '../Loading/SkeletonCard';
import ErrorMessage from '../Error/ErrorMessage';
import BackButton from '../common/BackButton';
import SearchableList from '../common/SearchableList';
import { useQuery } from '@tanstack/react-query';
import { fetchPrograms } from '../../../api/programsApi';
import { ChevronLeft, Search, User, X } from 'lucide-react';

const ProgramSelection = ({ category, onBack ,setParticipant,setStep ,setSelectedProgram}) => {
  const [participantName, setParticipantName] = useState("");
  const [selectedProgramState, setSelectedProgramState] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['programs', category],
    queryFn: fetchPrograms,
    staleTime: 50 * 60 * 1000,
    refetchInterval: 50 * 60 * 1000,
  });

  const programs = data?.program;

  const handleSelect = (program) => {
    setSelectedProgramState(program);
    if (program.participant_required === 'Y') {
      setOpenModal(true);
    } else {
      setStep(3)
      setSelectedProgram(program?.program_id)
    }
  };

  const handleConfirm = () => {
    if (selectedProgramState) {
      setSelectedProgram(selectedProgramState?.program_id)
      setOpenModal(false);
      setStep(3)
      setParticipant(participantName);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <ErrorMessage 
            message={error} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SearchableList
          items={programs}
          renderItem={(program) => (
            <div 
              className="transform transition-all duration-200 hover:scale-[1.02]"
              key={program.program_id}
            >
              <DonationCard
                title={program.program_name}
                description={program.description}
                onClick={() => handleSelect(program)}
                selected={selectedProgramState?.program_id === program.program_id}
                className="h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </div>
          )}
          searchKey="program_name"
          placeholder="Search programs..."
          className="w-full"
          searchInputClassName="w-full px-4 py-3 pl-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
          searchIconClassName="absolute left-4 top-3.5 text-gray-400"
          SearchIcon={Search}
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
      <div className="space-y-6">
      <BackButton onClick={onBack} />
      <h2 className="text-2xl font-bold text-gray-900">Select a Program</h2>
        </div>
      </div>

      {renderContent()}

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-50 ">
          <div className="relative w-full max-w-md transform transition-all">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Enter Participant Name
                </h3>
                <button 
                  onClick={() => setOpenModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter participant name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
                <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setOpenModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium
                           hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                           transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!participantName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium
                           hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramSelection;