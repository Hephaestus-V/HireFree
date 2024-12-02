import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import Head from "next/head";
import Link from "next/link";

interface Milestone {
  name: string;
  amount: string;
  completed: boolean;
}

interface Project {
  id: number;
  client_address: string;
  freelancer_address: string;
  title: string;
  description: string;
  budget: number;
  timeline: number;
  milestones: string;
  status: string;
  timestamp: number;
}

export default function ProjectDetails() {
  const router = useRouter();
  const { query } = router;
  const parsedMilestones = query.milestones ? JSON.parse(String(query.milestones)) : [];

  const project = {
    id: Number(query.projectId),
    title: String(query.title),
    description: String(query.description),
    budget: Number(query.budget),
    timeline: Number(query.timeline),
    milestones: String(query.milestones),
    status: String(query.status),
    client_address: String(query.client_address),
    freelancer_address: String(query.freelancer_address)
  };

  const handleCreateInvoice = async (milestoneIndex: number) => {
    try {
      await fetch('/api/project/updateMilestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          milestoneIndex
        }),
      });

      router.push('/create-invoice');
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  return (
    <>
      <Head>
        <title>{project?.title || 'Project Details'} - HireFree</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
            <div className="grid gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{project.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Project Details</h2>
                  <p className="text-gray-600">Budget: ${project.budget}</p>
                  <p className="text-gray-600">Timeline: {project.timeline} days</p>
                  <p className="text-gray-600">Status: {project.status}</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Client</h2>
                  <p className="text-gray-600">{project.client_address}</p>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Milestones</h2>
                <div className="space-y-4">
                  {parsedMilestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        milestone.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">
                            {milestone.completed && (
                              <span className="text-green-500 mr-2">✓</span>
                            )}
                            {milestone.name}
                          </h3>
                          <p className="text-gray-600">Amount: ${milestone.amount}</p>
                        </div>
                        {!milestone.completed && (
                          <button
                            onClick={() => handleCreateInvoice(index)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Create Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
