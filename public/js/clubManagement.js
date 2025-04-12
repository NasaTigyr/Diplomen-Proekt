/**
 * Club Management JavaScript
 * Handles the functionality for the Club Management page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initPage();

    // Set up event listeners
    setupEventListeners();
});

// Global variables
let clubData = null;
let clubAthletes = [];
let joinRequests = [];
let invitations = [];
let currentAthlete = null;

/**
 * Initialize the page
 */
function initPage() {
    // Load club data
    loadClubData();
    
    // Load tab-specific data
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        handleTabChange(activeTab.getAttribute('id'));
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('#clubManagementTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            handleTabChange(this.getAttribute('id'));
        });
    });

    // Edit club button
    document.getElementById('edit-club-btn').addEventListener('click', openEditClubModal);
    
    // Save club changes button
    document.getElementById('save-club-changes').addEventListener('click', saveClubChanges);
    
    // Invite athlete button
    document.getElementById('invite-athlete-button').addEventListener('click', function() {
        // Switch to invitations tab
        const invitationsTab = document.getElementById('invitations-tab');
        bootstrap.Tab.getOrCreateInstance(invitationsTab).show();
        
        // Focus on the email input field
        setTimeout(() => {
            document.getElementById('invitation-email').focus();
        }, 500);
    });
    
    // Invitation form submission
    document.getElementById('invitation-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendInvitation();
    });
    
    // Verification form submission
    document.getElementById('verification-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitVerification();
    });
    
    // Search athletes
    document.getElementById('athlete-search-button').addEventListener('click', function() {
        searchAthletes(document.getElementById('athlete-search').value);
    });
    
    document.getElementById('athlete-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchAthletes(this.value);
        }
    });

    // Remove athlete button in modal
    document.getElementById('remove-athlete-btn').addEventListener('click', function() {
        if (currentAthlete) {
            removeAthleteFromClub(currentAthlete.id);
        }
    });
}

/**
 * Handle tab changes
 * @param {string} tabId - The ID of the selected tab
 */
function handleTabChange(tabId) {
    switch (tabId) {
        case 'athletes-tab':
            loadAthletes();
            break;
        case 'requests-tab':
            loadJoinRequests();
            break;
        case 'invitations-tab':
            loadInvitations();
            break;
        case 'verification-tab':
            loadVerificationStatus();
            break;
    }
}

/**
 * Load club data
 */
function loadClubData() {
    // Show loading state
    showLoadingState('club');
    
    // Fetch club data from server
    fetch('/clubs/my-club')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load club data');
            }
            return response.json();
        })
        .then(data => {
            clubData = data;
            displayClubData(data);
            return loadClubStatistics();
        })
        .catch(error => {
            console.error('Error loading club data:', error);
            showErrorMessage('Failed to load club data. Please refresh the page or try again later.');
        });
}

/**
 * Load club statistics
 */
function loadClubStatistics() {
    if (!clubData || !clubData.id) {
        return Promise.reject(new Error('No club data available'));
    }
    
    return fetch(`/clubs/${clubData.id}/statistics`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load club statistics');
            }
            return response.json();
        })
        .then(data => {
            displayClubStatistics(data);
        })
        .catch(error => {
            console.error('Error loading club statistics:', error);
            // Don't show error message for statistics, just log it
        });
}

/**
 * Display club data on the page
 * @param {Object} club - The club data
 */
function displayClubData(club) {
    // Club logo
    const logoContainer = document.getElementById('club-logo-container');
    logoContainer.innerHTML = '';
    
    if (club.logo) {
        const logoImg = document.createElement('img');
        logoImg.src = club.logo;
        logoImg.alt = `${club.name} Logo`;
        logoImg.className = 'img-fluid';
        logoImg.style.maxHeight = '150px';
        logoContainer.appendChild(logoImg);
    } else {
        // Default logo placeholder
        const defaultLogo = document.createElement('div');
        defaultLogo.className = 'bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto';
        defaultLogo.style.width = '150px';
        defaultLogo.style.height = '150px';
        
        const logoText = document.createElement('span');
        logoText.className = 'text-white display-4';
        logoText.textContent = club.name.charAt(0).toUpperCase();
        
        defaultLogo.appendChild(logoText);
        logoContainer.appendChild(defaultLogo);
    }
    
    // Club name and description
    document.getElementById('club-name').textContent = club.name;
    document.getElementById('club-description').textContent = club.description || 'No description available';
    
    // Contact information
    document.getElementById('club-address').textContent = club.address || 'Not specified';
    document.getElementById('club-phone').textContent = club.phone || 'Not specified';
    document.getElementById('club-email').textContent = club.email || 'Not specified';
    
    // Website
    const clubWebsiteContainer = document.getElementById('club-website-container');
    const clubWebsite = document.getElementById('club-website');
    
    if (club.website) {
        clubWebsiteContainer.classList.remove('d-none');
        clubWebsite.innerHTML = `<a href="${club.website}" target="_blank">${club.website}</a>`;
    } else {
        clubWebsiteContainer.classList.remove('d-none');
        clubWebsite.textContent = 'Not specified';
    }
    
    // Verification status
    updateVerificationStatus(club.verification_status || 'pending');
    
    // Populate edit form
    populateEditForm(club);
}

/**
 * Display club statistics
 * @param {Object} stats - The club statistics
 */
function displayClubStatistics(stats) {
    document.getElementById('athlete-count').textContent = stats.athlete_count || 0;
    document.getElementById('event-count').textContent = stats.event_count || 0;
    document.getElementById('competition-count').textContent = stats.competition_count || 0;
}

/**
 * Update verification status badge
 * @param {string} status - The verification status
 */
function updateVerificationStatus(status) {
    const badge = document.getElementById('verification-status-badge');
    
    badge.className = 'badge';
    badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch (status) {
        case 'verified':
            badge.classList.add('bg-success');
            break;
        case 'pending':
            badge.classList.add('bg-warning', 'text-dark');
            break;
        case 'rejected':
            badge.classList.add('bg-danger');
            break;
        default:
            badge.classList.add('bg-secondary');
    }
    
    // Update verification tab message
    updateVerificationTabMessage(status);
}

/**
 * Update verification tab message based on status
 * @param {string} status - The verification status
 */
function updateVerificationTabMessage(status) {
    const messageContainer = document.getElementById('verification-status-message');
    const formContainer = document.getElementById('verification-form-container');
    const progressContainer = document.getElementById('verification-progress-container');
    
    messageContainer.innerHTML = '';
    progressContainer.innerHTML = '';
    
    let message = '';
    let alertClass = '';
    let icon = '';
    let showForm = true;
    
    switch (status) {
        case 'verified':
            message = 'Congratulations! Your club is verified. You now have access to all features of the platform.';
            alertClass = 'alert-success';
            icon = 'bi-check-circle-fill';
            showForm = false;
            break;
        case 'pending':
            message = 'Your club verification is pending. Our team is reviewing your documents.';
            alertClass = 'alert-warning';
            icon = 'bi-hourglass-split';
            showForm = false;
            
            // Show progress indicator
            progressContainer.innerHTML = `
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                         role="progressbar" aria-valuenow="50" aria-valuemin="0" 
                         aria-valuemax="100" style="width: 50%">
                        In Review
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">This process usually takes 1-3 business days.</small>
            `;
            break;
        case 'rejected':
            message = 'Your club verification was not approved. Please review the feedback and submit updated documents.';
            alertClass = 'alert-danger';
            icon = 'bi-x-circle-fill';
            showForm = true;
            break;
        default:
            message = 'Your club is not yet verified. Verification gives you access to additional features and increases trust for potential members.';
            alertClass = 'alert-info';
            icon = 'bi-info-circle-fill';
            showForm = true;
            break;
    }
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass}`;
    alert.innerHTML = `<i class="bi ${icon} me-2"></i>${message}`;
    
    messageContainer.appendChild(alert);
    
    if (status !== 'verified' && status !== 'pending') {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Submit your verification documents below to start the verification process.';
        messageContainer.appendChild(paragraph);
    }
    
    // Show or hide the form based on status
    formContainer.classList.toggle('d-none', !showForm);
}

/**
 * Populate edit club form with current data
 * @param {Object} club - The club data
 */
function populateEditForm(club) {
    document.getElementById('edit-club-name').value = club.name || '';
    document.getElementById('edit-club-description').value = club.description || '';
    document.getElementById('edit-club-address').value = club.address || '';
    document.getElementById('edit-club-phone').value = club.phone || '';
    document.getElementById('edit-club-email').value = club.email || '';
    document.getElementById('edit-club-website').value = club.website || '';
    
    // Show current logo preview if it exists
    const currentLogoPreview = document.getElementById('current-logo-preview');
    const currentLogoImg = document.getElementById('current-logo-img');
    
    if (club.logo) {
        currentLogoPreview.classList.remove('d-none');
        currentLogoImg.src = club.logo;
    } else {
        currentLogoPreview.classList.add('d-none');
    }
}

/**
 * Open edit club modal
 */
function openEditClubModal() {
    const modal = new bootstrap.Modal(document.getElementById('editClubModal'));
    modal.show();
}

/**
 * Save club changes
 */
function saveClubChanges() {
    const form = document.getElementById('edit-club-form');
    const formData = new FormData(form);
    
    // Add club ID
    formData.append('club_id', clubData.id);
    
    // Show loading state
    const saveButton = document.getElementById('save-club-changes');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    
    fetch('/clubs/update', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update club information');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editClubModal')).hide();
        
        // Show success message
        showSuccessMessage('Club information updated successfully');
        
        // Refresh club data
        loadClubData();
    })
    .catch(error => {
        console.error('Error updating club:', error);
        showErrorMessage('Failed to update club information. Please try again.');
    })
    .finally(() => {
        // Restore button state
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    });
}

/**
 * Load athletes
 */
function loadAthletes() {
    if (!clubData || !clubData.id) {
        return;
    }
    
    // Show loading state
    const tableBody = document.querySelector('#athletes-table-container tbody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading athletes...</p>
            </td>
        </tr>
    `;
    
    fetch(`/clubs/${clubData.id}/athletes`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load athletes');
            }
            return response.json();
        })
        .then(data => {
            clubAthletes = data;
            displayAthletes(data);
        })
        .catch(error => {
            console.error('Error loading athletes:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>Failed to load athletes. Please try again.
                    </td>
                </tr>
            `;
        });
}

/**
 * Display athletes in the table
 * @param {Array} athletes - The athletes data
 * @param {string} searchTerm - Optional search term for filtering
 */
function displayAthletes(athletes, searchTerm = '') {
    const tableBody = document.querySelector('#athletes-table-container tbody');
    const noAthletesMessage = document.getElementById('no-athletes-message');
    
    // Filter athletes if search term is provided
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        athletes = athletes.filter(athlete => 
            athlete.first_name.toLowerCase().includes(searchLower) || 
            athlete.last_name.toLowerCase().includes(searchLower) ||
            `${athlete.first_name} ${athlete.last_name}`.toLowerCase().includes(searchLower)
        );
    }
    
    if (athletes.length === 0) {
        tableBody.innerHTML = '';
        noAthletesMessage.classList.remove('d-none');
        return;
    }
    
    noAthletesMessage.classList.add('d-none');
    
    tableBody.innerHTML = athletes.map(athlete => {
        // Calculate age group based on birth date
        const ageGroup = calculateAgeGroup(athlete.date_of_birth);
        
        // Format gender
        const gender = athlete.gender ? athlete.gender.charAt(0).toUpperCase() + athlete.gender.slice(1) : 'Not specified';
        
        // Status badge
        let statusBadge = '';
        switch (athlete.status) {
            case 'active':
                statusBadge = '<span class="badge bg-success">Active</span>';
                break;
            case 'inactive':
                statusBadge = '<span class="badge bg-secondary">Inactive</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
        }
        
        return `
            <tr data-athlete-id="${athlete.id}">
                <td>${athlete.first_name} ${athlete.last_name}</td>
                <td>${ageGroup}</td>
                <td>${gender}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary view-athlete-btn" 
                                data-athlete-id="${athlete.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger remove-athlete-btn" 
                                data-athlete-id="${athlete.id}">
                            <i class="bi bi-person-x"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to athlete action buttons
    tableBody.querySelectorAll('.view-athlete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const athleteId = this.getAttribute('data-athlete-id');
            viewAthleteDetails(athleteId);
        });
    });
    
    tableBody.querySelectorAll('.remove-athlete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const athleteId = this.getAttribute('data-athlete-id');
            removeAthleteFromClub(athleteId);
        });
    });
}

/**
 * Calculate age group based on birth date
 * @param {string} dateOfBirth - The date of birth
 * @returns {string} - The age group
 */
function calculateAgeGroup(dateOfBirth) {
    if (!dateOfBirth) return 'Not specified';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Determine age group
    if (age < 8) return 'Under 8';
    if (age < 12) return 'Under 12';
    if (age < 14) return 'Under 14';
    if (age < 16) return 'Under 16';
    if (age < 18) return 'Under 18';
    if (age < 21) return 'Under 21';
    return 'Senior';
}

/**
 * Search athletes
 * @param {string} searchTerm - The search term
 */
function searchAthletes(searchTerm) {
    displayAthletes(clubAthletes, searchTerm);
}

/**
 * View athlete details
 * @param {string} athleteId - The athlete ID
 */
function viewAthleteDetails(athleteId) {
    const athlete = clubAthletes.find(a => a.id.toString() === athleteId.toString());
    
    if (!athlete) {
        showErrorMessage('Athlete information not found');
        return;
    }
    
    // Set currentAthlete for the remove function
    currentAthlete = athlete;
    
    // Populate athlete details modal
    document.getElementById('athleteDetailsModalLabel').textContent = `${athlete.first_name} ${athlete.last_name}`;
    
    // Profile image/initials
    const profileImageContainer = document.getElementById('athlete-profile-image');
    profileImageContainer.innerHTML = '';
    
    if (athlete.profile_picture) {
        // Show profile picture
        const img = document.createElement('img');
        img.src = athlete.profile_picture;
        img.alt = `${athlete.first_name} ${athlete.last_name}`;
        img.className = 'rounded-circle';
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        profileImageContainer.appendChild(img);
    } else {
        // Show initials
        const initialsDiv = document.createElement('div');
        initialsDiv.className = 'bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto';
        initialsDiv.style.width = '100px';
        initialsDiv.style.height = '100px';
        
        const initialsSpan = document.createElement('span');
        initialsSpan.className = 'text-white display-6';
        initialsSpan.textContent = `${athlete.first_name.charAt(0)}${athlete.last_name.charAt(0)}`;
        
        initialsDiv.appendChild(initialsSpan);
        profileImageContainer.appendChild(initialsDiv);
    }
    
    // Name and status
    document.getElementById('athlete-name').textContent = `${athlete.first_name} ${athlete.last_name}`;
    
    // Status badge
    const statusBadgeContainer = document.getElementById('athlete-status-badge');
    let badgeHTML = '';
    switch (athlete.status) {
        case 'active':
            badgeHTML = '<span class="badge bg-success">Active</span>';
            break;
        case 'inactive':
            badgeHTML = '<span class="badge bg-secondary">Inactive</span>';
            break;
        default:
            badgeHTML = '<span class="badge bg-warning text-dark">Pending</span>';
    }
    statusBadgeContainer.innerHTML = badgeHTML;
    
    // Contact information
    document.getElementById('athlete-email').textContent = athlete.email || 'Not provided';
    document.getElementById('athlete-phone').textContent = athlete.contact_number || 'Not provided';
    
    // Personal information
    document.getElementById('athlete-gender').textContent = athlete.gender ? 
        (athlete.gender.charAt(0).toUpperCase() + athlete.gender.slice(1)) : 'Not specified';
    
    document.getElementById('athlete-dob').textContent = athlete.date_of_birth ? 
        new Date(athlete.date_of_birth).toLocaleDateString() : 'Not specified';
    
    document.getElementById('athlete-age-group').textContent = calculateAgeGroup(athlete.date_of_birth);
    
    document.getElementById('athlete-join-date').textContent = athlete.join_date ? 
        new Date(athlete.join_date).toLocaleDateString() : 'Not specified';
    
    // Load athlete's competitions (if needed)
    loadAthleteCompetitions(athleteId);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('athleteDetailsModal'));
    modal.show();
}

/**
 * Load athlete's competitions
 * @param {string} athleteId - The athlete ID
 */
function loadAthleteCompetitions(athleteId) {
    const competitionsList = document.getElementById('athlete-competitions-list');
    
    // Show loading state
    competitionsList.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mb-0">Loading competitions...</p>
        </div>
    `;
    
    fetch(`/athletes/${athleteId}/competitions`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load competitions');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                competitionsList.innerHTML = `
                    <div class="text-center py-3">
                        <p class="text-muted mb-0">No competition history available</p>
                    </div>
                `;
                return;
            }
            
            const competitionsHTML = data.map(comp => {
                let statusBadge = '';
                switch (comp.status) {
                    case 'approved':
                        statusBadge = '<span class="badge bg-success">Approved</span>';
                        break;
                    case 'rejected':
                        statusBadge = '<span class="badge bg-danger">Rejected</span>';
                        break;
                    default:
                        statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
                }
                
                return `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${comp.event_name}</strong>
                            <br>
                            <small>${comp.category_name} - ${new Date(comp.event_date).toLocaleDateString()}</small>
                        </div>
                        ${statusBadge}
                    </li>
                `;
            }).join('');
            
            competitionsList.innerHTML = `<ul class="list-group">${competitionsHTML}</ul>`;
        })
        .catch(error => {
            console.error('Error loading competitions:', error);
            competitionsList.innerHTML = `
                <div class="text-center py-3">
                    <p class="text-danger mb-0">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Failed to load competition history
                    </p>
                </div>
            `;
        });
}

/**
 * Remove athlete from club
 * @param {string} athleteId - The athlete ID
 */
function removeAthleteFromClub(athleteId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to remove this athlete from your club?')) {
        return;
    }
    
    fetch(`/clubs/${clubData.id}/athletes/${athleteId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to remove athlete');
        }
        return response.json();
    })
    .then(data => {
        // Close modal if open
        const modal = document.getElementById('athleteDetailsModal');
        if (modal) {
            bootstrap.Modal.getInstance(modal)?.hide();
        }
        
        // Show success message
        showSuccessMessage('Athlete removed from club successfully');
        
        // Refresh athletes
        loadAthletes();
        
        // Refresh club statistics
        loadClubStatistics();
    })
    .catch(error => {
        console.error('Error removing athlete:', error);
        showErrorMessage('Failed to remove athlete. Please try again.');
    });
}

/**
 * Load join requests
 */
function loadJoinRequests() {
    if (!clubData || !clubData.id) {
        return;
    }
    
    // Show loading state
    const tableBody = document.querySelector('#requests-table-container tbody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading requests...</p>
            </td>
        </tr>
    `;
    
    fetch(`/clubs/${clubData.id}/join-requests`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load join requests');
            }
            return response.json();
        })
        .then(data => {
            joinRequests = data;
            displayJoinRequests(data);
        })
        .catch(error => {
            console.error('Error loading join requests:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>Failed to load join requests. Please try again.
                    </td>
                </tr>
            `;
        });
}

/**
 * Display join requests
 * @param {Array} requests - The join requests data
 */
function displayJoinRequests(requests) {
    const tableBody = document.querySelector('#requests-table-container tbody');
    const noRequestsMessage = document.getElementById('no-requests-message');
    
    if (requests.length === 0) {
        tableBody.innerHTML = '';
        noRequestsMessage.classList.remove('d-none');
        return;
    }
    
    noRequestsMessage.classList.add('d-none');
    
    tableBody.innerHTML = requests.map(request => {
        const ageGroup = calculateAgeGroup(request.date_of_birth);
        const gender = request.gender ? request.gender.charAt(0).toUpperCase() + request.gender.slice(1) : 'Not specified';
        const requestDate = new Date(request.request_date).toLocaleDateString();
        
        return `
            <tr data-request-id="${request.id}">
                <td>${request.first_name} ${request.last_name}</td>
                <td>${request.email}</td>
                <td>${ageGroup}</td>
                <td>${gender}</td>
                <td>${requestDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-success approve-request-btn" 
                                data-request-id="${request.id}" data-athlete-id="${request.athlete_id}">
                            <i class="bi bi-check"></i> Approve
                        </button>
                        <button type="button" class="btn btn-danger reject-request-btn" 
                                data-request-id="${request.id}" data-athlete-id="${request.athlete_id}">
                            <i class="bi bi-x"></i> Reject
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to request action buttons
    tableBody.querySelectorAll('.approve-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            const athleteId = this.getAttribute('data-athlete-id');
            approveJoinRequest(requestId, athleteId);
        });
    });
    
    tableBody.querySelectorAll('.reject-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            const athleteId = this.getAttribute('data-athlete-id');
            rejectJoinRequest(requestId, athleteId);
        });
    });
}

/**
 * Approve join request
 * @param {string} requestId - The request ID
 * @param {string} athleteId - The athlete ID
 */

fetch(`/clubs/${clubData.id}/join-requests/${requestId}/approve`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to approve join request');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Join request approved successfully');
        
        // Refresh join requests
        loadJoinRequests();
        
        // Refresh athletes
        loadAthletes();
        
        // Refresh club statistics
        loadClubStatistics();
    })
    .catch(error => {
        console.error('Error approving join request:', error);
        showErrorMessage('Failed to approve join request. Please try again.');
    });

/**
 * Reject join request
 * @param {string} requestId - The request ID
 * @param {string} athleteId - The athlete ID
 */

function approveJoinRequest(requestId, athleteId) {
    // Show confirmation dialog if needed
    if (!confirm('Are you sure you want to approve this join request?')) {
        return;
    }
    
    fetch(`/clubs/${clubData.id}/join-requests/${requestId}/approve`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to approve join request');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Join request approved successfully');
        
        // Refresh join requests
        loadJoinRequests();
        
        // Refresh athletes
        loadAthletes();
        
        // Refresh club statistics
        loadClubStatistics();
    })
    .catch(error => {
        console.error('Error approving join request:', error);
        showErrorMessage('Failed to approve join request. Please try again.');
    });
}


function rejectJoinRequest(requestId, athleteId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to reject this join request?')) {
        return;
    }
    
    fetch(`/clubs/${clubData.id}/join-requests/${requestId}/reject`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to reject join request');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Join request rejected successfully');
        
        // Refresh join requests
        loadJoinRequests();
    })
    .catch(error => {
        console.error('Error rejecting join request:', error);
        showErrorMessage('Failed to reject join request. Please try again.');
    });
}

/**
 * Load invitations
 */
function loadInvitations() {
    if (!clubData || !clubData.id) {
        return;
    }
    
    // Show loading state
    const tableBody = document.querySelector('#invitations-table-container tbody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading invitations...</p>
            </td>
        </tr>
    `;
    
    fetch(`/clubs/${clubData.id}/invitations`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load invitations');
            }
            return response.json();
        })
        .then(data => {
            invitations = data;
            displayInvitations(data);
        })
        .catch(error => {
            console.error('Error loading invitations:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>Failed to load invitations. Please try again.
                    </td>
                </tr>
            `;
        });
}
/**
 * Display invitations
 * @param {Array} invitationsList - The invitations data
 */
function displayInvitations(invitationsList) {
    const tableBody = document.querySelector('#invitations-table-container tbody');
    const noInvitationsMessage = document.getElementById('no-invitations-message');
    
    if (invitationsList.length === 0) {
        tableBody.innerHTML = '';
        noInvitationsMessage.classList.remove('d-none');
        return;
    }
    
    noInvitationsMessage.classList.add('d-none');
    
    tableBody.innerHTML = invitationsList.map(invitation => {
        const sentDate = new Date(invitation.sent_date).toLocaleDateString();
        
        // Status badge
        let statusBadge = '';
        switch (invitation.status) {
            case 'accepted':
                statusBadge = '<span class="badge bg-success">Accepted</span>';
                break;
            case 'rejected':
                statusBadge = '<span class="badge bg-danger">Rejected</span>';
                break;
            case 'expired':
                statusBadge = '<span class="badge bg-secondary">Expired</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
        }
        
        // Action buttons
        let actionButtons = '';
        if (invitation.status === 'pending') {
            actionButtons = `
                <button type="button" class="btn btn-sm btn-outline-primary resend-invitation-btn" 
                        data-invitation-id="${invitation.id}">
                    <i class="bi bi-envelope"></i> Resend
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger cancel-invitation-btn" 
                        data-invitation-id="${invitation.id}">
                    <i class="bi bi-x-circle"></i> Cancel
                </button>
            `;
        } else {
            actionButtons = `
                <button type="button" class="btn btn-sm btn-outline-secondary" disabled>
                    <i class="bi bi-dash-circle"></i> No actions
                </button>
            `;
        }
        
        return `
            <tr data-invitation-id="${invitation.id}">
                <td>${invitation.email}</td>
                <td>${sentDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to invitation action buttons
    tableBody.querySelectorAll('.resend-invitation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const invitationId = this.getAttribute('data-invitation-id');
            resendInvitation(invitationId);
        });
    });
    
    tableBody.querySelectorAll('.cancel-invitation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const invitationId = this.getAttribute('data-invitation-id');
            cancelInvitation(invitationId);
        });
    });
}

/**
 * Send invitation
 */
function sendInvitation() {
    const email = document.getElementById('invitation-email').value;
    const message = document.getElementById('invitation-message').value;
    
    if (!email) {
        showErrorMessage('Please enter an email address');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#invitation-form button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    
    fetch('/clubs/invitations/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            club_id: clubData.id,
            email: email,
            message: message
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send invitation');
        }
        return response.json();
    })
    .then(data => {
        // Reset form
        document.getElementById('invitation-form').reset();
        
        // Show success message
        showSuccessMessage('Invitation sent successfully');
        
        // Refresh invitations
        loadInvitations();
    })
    .catch(error => {
        console.error('Error sending invitation:', error);
        showErrorMessage('Failed to send invitation. Please try again.');
    })
    .finally(() => {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

/**
 * Resend invitation
 * @param {string} invitationId - The invitation ID
 */
function resendInvitation(invitationId) {
    fetch(`/clubs/invitations/${invitationId}/resend`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to resend invitation');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Invitation resent successfully');
        
        // Refresh invitations
        loadInvitations();
    })
    .catch(error => {
        console.error('Error resending invitation:', error);
        showErrorMessage('Failed to resend invitation. Please try again.');
    });
}

/**
 * Cancel invitation
 * @param {string} invitationId - The invitation ID
 */
function cancelInvitation(invitationId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to cancel this invitation?')) {
        return;
    }
    
    fetch(`/clubs/invitations/${invitationId}/cancel`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to cancel invitation');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Invitation cancelled successfully');
        
        // Refresh invitations
        loadInvitations();
    })
    .catch(error => {
        console.error('Error cancelling invitation:', error);
        showErrorMessage('Failed to cancel invitation. Please try again.');
    });
}

/**
 * Load verification status
 */
function loadVerificationStatus() {
    if (!clubData || !clubData.id) {
        return;
    }
    
    // No additional API call needed as verification status is already in clubData
    // Just update the UI based on current status
    updateVerificationTabMessage(clubData.verification_status || 'pending');
}

/**
 * Submit verification documents
 */
function submitVerification() {
    const form = document.getElementById('verification-form');
    const formData = new FormData(form);
    
    // Add club ID
    formData.append('club_id', clubData.id);
    
    // Check if at least one document is selected
    const registrationDoc = document.getElementById('registration-document').files.length > 0;
    const coachCert = document.getElementById('coach-certification').files.length > 0;
    const federationDoc = document.getElementById('federation-document').files.length > 0;
    
    if (!registrationDoc && !coachCert && !federationDoc) {
        showErrorMessage('Please upload at least one verification document');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
    
    fetch('/clubs/verify', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit verification documents');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Verification documents submitted successfully. Our team will review them shortly.');
        
        // Update club data with new verification status
        clubData.verification_status = 'pending';
        
        // Update verification UI
        updateVerificationStatus('pending');
        
        // Reset form
        form.reset();
    })
    .catch(error => {
        console.error('Error submitting verification documents:', error);
        showErrorMessage('Failed to submit verification documents. Please try again.');
    })
    .finally(() => {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}
/**
 * Show loading state
 * @param {string} section - The section being loaded
 */
function showLoadingState(section) {
    if (section === 'club') {
        // Show loading state for club information
        document.getElementById('club-logo-container').innerHTML = `
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        
        document.getElementById('club-name').textContent = 'Loading...';
        document.getElementById('club-description').textContent = 'Loading club details...';
        document.getElementById('club-address').textContent = 'Loading...';
        document.getElementById('club-phone').textContent = 'Loading...';
        document.getElementById('club-email').textContent = 'Loading...';
        document.getElementById('club-website').textContent = 'Loading...';
    }
}

/**
 * Show success message
 * @param {string} message - The success message
 */
function showSuccessMessage(message) {
    const alertContainer = document.getElementById('alert-container');
    
    alertContainer.className = 'alert alert-success alert-dismissible fade show';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        bsAlert.close();
    }, 5000);
}

/**
 * Show error message
 * @param {string} message - The error message
 */
function showErrorMessage(message) {
    const alertContainer = document.getElementById('alert-container');
    
    alertContainer.className = 'alert alert-danger alert-dismissible fade show';
    alertContainer.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto hide after 7 seconds
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        bsAlert.close();
    }, 7000);
}
