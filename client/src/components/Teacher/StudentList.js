import React from 'react';

function StudentList({ students, onKickStudent }) {
  if (!students || students.length === 0) {
    return <div className="text-gray-600">No students connected yet.</div>;
  }

  return (
    <div>
      <ul className="divide-y divide-gray-200">
        {students.map((student) => (
          <li key={student.id} className="py-3 flex justify-between items-center">
            <span className="text-gray-700">{student.name}</span>
            <button
              onClick={() => onKickStudent(student.name)}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Kick
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
