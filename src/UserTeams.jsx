import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "./api";

function UserTeams() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  const groupedReferrals = {};
  user.referrals.forEach(ref => {
    if (!groupedReferrals[ref.stage]) groupedReferrals[ref.stage] = [];
    groupedReferrals[ref.stage].push(ref);
  });

  return (
    <div style={{ padding: "2rem" }}>
      <Link to="/users">← Back to Users</Link>
      <h2>Teams of {user.phone} ({user.referralCode})</h2>
      <p>Stage: {user.stage}</p>
      <p>Referred By: {user.referredBy ? `${user.referredBy.phone} (${user.referredBy.referralCode})` : "N/A"}</p>

      {Object.keys(groupedReferrals).length === 0 ? <p>No team members found.</p> :
        Object.keys(groupedReferrals).map(stage => (
          <div key={stage}>
            <h3>Stage {stage}</h3>
            <ul>
              {groupedReferrals[stage].map((ref, i) => (
                <li key={i}>{ref.person.phone} (Commission: {ref.totalCommission})</li>
              ))}
            </ul>
          </div>
        ))
      }
    </div>
  );
}

export default UserTeams;
