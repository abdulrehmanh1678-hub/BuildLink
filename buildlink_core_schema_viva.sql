-- BuildLink Core Relational Schema (MySQL 8+)
-- Simplified Version for Frontend Mocking
-- 18 Core Tables

CREATE TABLE roles (
  role_id   SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL UNIQUE,
  CONSTRAINT chk_roles_name CHECK (role_name IN ('owner', 'constructor', 'admin'))
) ENGINE=InnoDB;

CREATE TABLE users (
  user_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       SMALLINT UNSIGNED NOT NULL,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  is_verified   TINYINT(1)   NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  trust_score   DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_trust CHECK (trust_score BETWEEN 0 AND 5),
  CONSTRAINT fk_users_role   FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role_id);

CREATE TABLE service_regions (
  region_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  country   VARCHAR(80)  NOT NULL DEFAULT 'Pakistan',
  province  VARCHAR(80)  NOT NULL,
  city      VARCHAR(80)  NOT NULL,
  area_name VARCHAR(120),
  UNIQUE KEY uk_regions (country, province, city, area_name)
) ENGINE=InnoDB;

CREATE TABLE constructor_profiles (
  constructor_id          INT UNSIGNED PRIMARY KEY,
  company_name            VARCHAR(200) NOT NULL,
  license_number          VARCHAR(100) NOT NULL UNIQUE,
  years_experience        INT          NOT NULL,
  bio                     TEXT,
  website                 VARCHAR(255),
  minimum_project_budget  DECIMAL(14,2),
  created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_years_experience CHECK (years_experience >= 0),
  CONSTRAINT chk_min_budget       CHECK (minimum_project_budget IS NULL OR minimum_project_budget >= 0),
  CONSTRAINT fk_constructor_user  FOREIGN KEY (constructor_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE specializations (
  specialization_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  specialization_name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE constructor_specializations (
  constructor_id    INT UNSIGNED NOT NULL,
  specialization_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (constructor_id, specialization_id),
  CONSTRAINT fk_cs_constructor    FOREIGN KEY (constructor_id)    REFERENCES constructor_profiles(constructor_id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_specialization FOREIGN KEY (specialization_id) REFERENCES specializations(specialization_id)
) ENGINE=InnoDB;

CREATE TABLE constructor_service_regions (
  constructor_id INT UNSIGNED NOT NULL,
  region_id      INT UNSIGNED NOT NULL,
  PRIMARY KEY (constructor_id, region_id),
  CONSTRAINT fk_csr_constructor FOREIGN KEY (constructor_id) REFERENCES constructor_profiles(constructor_id) ON DELETE CASCADE,
  CONSTRAINT fk_csr_region      FOREIGN KEY (region_id)      REFERENCES service_regions(region_id)
) ENGINE=InnoDB;

CREATE TABLE plots (
  plot_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id       INT UNSIGNED  NOT NULL,
  region_id      INT UNSIGNED,
  street_address TEXT          NOT NULL,
  postal_code    VARCHAR(20),
  length         DECIMAL(10,2) NOT NULL,
  width          DECIMAL(10,2) NOT NULL,
  soil_type      VARCHAR(20)   NOT NULL DEFAULT 'unknown',
  topography     VARCHAR(20)   NOT NULL DEFAULT 'flat',
  status         VARCHAR(20)   NOT NULL DEFAULT 'active',
  has_water       TINYINT(1) NOT NULL DEFAULT 0,
  has_electricity TINYINT(1) NOT NULL DEFAULT 0,
  has_gas         TINYINT(1) NOT NULL DEFAULT 0,
  has_sewer       TINYINT(1) NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_plot_length     CHECK (length > 0),
  CONSTRAINT chk_plot_width      CHECK (width > 0),
  CONSTRAINT chk_plot_soil       CHECK (soil_type   IN ('clay','sandy','loamy','rocky','mixed','unknown')),
  CONSTRAINT chk_plot_topography CHECK (topography  IN ('flat','sloped','hilly','mixed')),
  CONSTRAINT chk_plot_status     CHECK (status      IN ('active','inactive','sold')),
  CONSTRAINT fk_plots_owner      FOREIGN KEY (owner_id)  REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_plots_region     FOREIGN KEY (region_id) REFERENCES service_regions(region_id)
) ENGINE=InnoDB;

CREATE TABLE project_requests (
  request_id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id                 INT UNSIGNED  NOT NULL,
  plot_id                  INT UNSIGNED  NOT NULL,
  project_type             VARCHAR(20)   NOT NULL DEFAULT 'residential',
  number_of_floors         INT           NOT NULL DEFAULT 1,
  total_area               DECIMAL(14,2) NOT NULL,
  budget_min               DECIMAL(14,2) NOT NULL,
  budget_max               DECIMAL(14,2) NOT NULL,
  timeline_start_date      DATE,
  expected_duration_months INT,
  description              TEXT          NOT NULL,
  status                   VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_req_type     CHECK (project_type IN ('residential','commercial','renovation','custom')),
  CONSTRAINT chk_req_status   CHECK (status       IN ('pending','active','accepted','rejected','cancelled','completed')),
  CONSTRAINT chk_req_floors   CHECK (number_of_floors >= 1),
  CONSTRAINT chk_req_area     CHECK (total_area > 0),
  CONSTRAINT chk_req_bmin     CHECK (budget_min >= 0),
  CONSTRAINT chk_req_bmax     CHECK (budget_max >= budget_min),
  CONSTRAINT chk_req_duration CHECK (expected_duration_months IS NULL OR expected_duration_months > 0),
  CONSTRAINT fk_req_owner     FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_req_plot      FOREIGN KEY (plot_id)  REFERENCES plots(plot_id)  ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE request_constructor_targets (
  request_target_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id         INT UNSIGNED NOT NULL,
  constructor_id     INT UNSIGNED NOT NULL,
  invited_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  invitation_message TEXT,
  UNIQUE KEY uk_req_constructor (request_id, constructor_id),
  CONSTRAINT fk_rct_request     FOREIGN KEY (request_id)    REFERENCES project_requests(request_id)          ON DELETE CASCADE,
  CONSTRAINT fk_rct_constructor FOREIGN KEY (constructor_id) REFERENCES constructor_profiles(constructor_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quotes (
  quote_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id      INT UNSIGNED  NOT NULL,
  constructor_id  INT UNSIGNED  NOT NULL,
  materials_cost  DECIMAL(14,2) NOT NULL,
  labor_cost      DECIMAL(14,2) NOT NULL,
  permits_cost    DECIMAL(14,2) NOT NULL DEFAULT 0,
  other_cost      DECIMAL(14,2) NOT NULL DEFAULT 0,
  start_date      DATE          NOT NULL,
  end_date        DATE          NOT NULL,
  duration_months DECIMAL(6,2)  NOT NULL,
  description     TEXT          NOT NULL,
  status          VARCHAR(20)   NOT NULL DEFAULT 'submitted',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_quotes_req_con (request_id, constructor_id),
  CONSTRAINT chk_quote_status   CHECK (status IN ('submitted','viewed','accepted','rejected','expired')),
  CONSTRAINT chk_quote_material CHECK (materials_cost >= 0),
  CONSTRAINT chk_quote_labor    CHECK (labor_cost >= 0),
  CONSTRAINT chk_quote_permits  CHECK (permits_cost >= 0),
  CONSTRAINT chk_quote_other    CHECK (other_cost >= 0),
  CONSTRAINT chk_quote_duration CHECK (duration_months >= 0),
  CONSTRAINT fk_quotes_request  FOREIGN KEY (request_id)    REFERENCES project_requests(request_id)          ON DELETE CASCADE,
  CONSTRAINT fk_quotes_con      FOREIGN KEY (constructor_id) REFERENCES constructor_profiles(constructor_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE projects (
  project_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id         INT UNSIGNED  NOT NULL,
  accepted_quote_id  INT UNSIGNED  NOT NULL UNIQUE,
  owner_id           INT UNSIGNED  NOT NULL,
  constructor_id     INT UNSIGNED  NOT NULL,
  status             VARCHAR(20)   NOT NULL DEFAULT 'pending',
  started_at         TIMESTAMP     NULL,
  completed_at       TIMESTAMP     NULL,
  final_amount       DECIMAL(14,2),
  created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_projects_status       CHECK (status IN ('pending','in_progress','on_hold','completed','cancelled')),
  CONSTRAINT chk_projects_final_amount CHECK (final_amount IS NULL OR final_amount >= 0),
  CONSTRAINT fk_projects_request       FOREIGN KEY (request_id)        REFERENCES project_requests(request_id),
  CONSTRAINT fk_projects_quote         FOREIGN KEY (accepted_quote_id) REFERENCES quotes(quote_id),
  CONSTRAINT fk_projects_owner         FOREIGN KEY (owner_id)          REFERENCES users(user_id),
  CONSTRAINT fk_projects_constructor   FOREIGN KEY (constructor_id)    REFERENCES constructor_profiles(constructor_id)
) ENGINE=InnoDB;

CREATE TABLE project_progress_updates (
  progress_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id       INT UNSIGNED  NOT NULL,
  updated_by       INT UNSIGNED  NOT NULL,
  status_note      TEXT          NOT NULL,
  progress_percent DECIMAL(5,2),
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_ppu_percent   CHECK (progress_percent IS NULL OR (progress_percent BETWEEN 0 AND 100)),
  CONSTRAINT fk_ppu_project    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  CONSTRAINT fk_ppu_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  review_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id       INT UNSIGNED     NOT NULL UNIQUE,
  reviewer_id      INT UNSIGNED     NOT NULL,
  constructor_id   INT UNSIGNED     NOT NULL,
  rating_value     TINYINT UNSIGNED NOT NULL,
  review_comment   TEXT,
  created_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_reviews_rating    CHECK (rating_value BETWEEN 1 AND 5),
  CONSTRAINT fk_reviews_project    FOREIGN KEY (project_id)     REFERENCES projects(project_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_reviewer   FOREIGN KEY (reviewer_id)    REFERENCES users(user_id),
  CONSTRAINT fk_reviews_constructor FOREIGN KEY (constructor_id) REFERENCES constructor_profiles(constructor_id)
) ENGINE=InnoDB;

CREATE TABLE message_threads (
  thread_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id     INT UNSIGNED,
  project_id     INT UNSIGNED,
  participant_1  INT UNSIGNED NOT NULL,
  participant_2  INT UNSIGNED NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_thread_target CHECK (request_id IS NOT NULL OR project_id IS NOT NULL),
  CONSTRAINT fk_mt_request      FOREIGN KEY (request_id)    REFERENCES project_requests(request_id) ON DELETE SET NULL,
  CONSTRAINT fk_mt_project      FOREIGN KEY (project_id)    REFERENCES projects(project_id)         ON DELETE SET NULL,
  CONSTRAINT fk_mt_participant1 FOREIGN KEY (participant_1) REFERENCES users(user_id),
  CONSTRAINT fk_mt_participant2 FOREIGN KEY (participant_2) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE messages (
  message_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  thread_id    INT UNSIGNED NOT NULL,
  sender_id    INT UNSIGNED NOT NULL,
  message_body TEXT         NOT NULL,
  sent_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read      TINYINT(1)   NOT NULL DEFAULT 0,
  CONSTRAINT fk_messages_thread FOREIGN KEY (thread_id) REFERENCES message_threads(thread_id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  contact_message_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name         VARCHAR(80)  NOT NULL,
  last_name          VARCHAR(80)  NOT NULL,
  email              VARCHAR(160) NOT NULL,
  subject            VARCHAR(180) NOT NULL,
  message_body       TEXT         NOT NULL,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE budget_analyses (
  analysis_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requested_by     INT UNSIGNED,
  plot_area        DECIMAL(14,2) NOT NULL,
  building_area    DECIMAL(14,2) NOT NULL,
  number_of_floors INT           NOT NULL,
  quality_level    VARCHAR(20)   NOT NULL DEFAULT 'standard',
  total_estimate   DECIMAL(14,2),
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ba_requested_by FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (role_id, role_name) VALUES (1, 'owner'), (2, 'constructor'), (3, 'admin');
