const Dashboard = () => {
  return (
      <>
          {/* Page Title */}
          <div className="row">
              <div className="col-12">
                  <div className="page-title-box">

                      <div className="page-title-right">
                          <form className="d-flex">
                              <div className="input-group">
                                  <input
                                      type="text"
                                      className="form-control form-control-light"
                                      placeholder="Select Date"
                                  />

                                  <span className="input-group-text bg-primary border-primary text-white">
                                      <i className="mdi mdi-calendar-range font-13"></i>
                                  </span>
                              </div>

                              <button
                                  type="button"
                                  className="btn btn-primary ms-2"
                              >
                                  <i className="mdi mdi-autorenew"></i>
                              </button>

                              <button
                                  type="button"
                                  className="btn btn-primary ms-1"
                              >
                                  <i className="mdi mdi-filter-variant"></i>
                              </button>
                          </form>
                      </div>

                      <h4 className="page-title">
                          Dashboard
                      </h4>
                  </div>
              </div>
          </div>

          {/* Statistics */}
          <div className="row">

              {/* Students */}
              <div className="col-lg-3 col-md-6">
                  <div className="card widget-flat">
                      <div className="card-body">

                          <div className="float-end">
                              <i className="mdi mdi-account-group widget-icon"></i>
                          </div>

                          <h5 className="text-muted fw-normal mt-0">
                              Students
                          </h5>

                          <h3 className="mt-3 mb-3">
                              1,254
                          </h3>

                          <p className="mb-0 text-muted">
                              <span className="text-success me-2">
                                  <i className="mdi mdi-arrow-up-bold"></i>
                                  5.27%
                              </span>

                              <span className="text-nowrap">
                                  Since last month
                              </span>
                          </p>

                      </div>
                  </div>
              </div>

              {/* Teachers */}
              <div className="col-lg-3 col-md-6">
                  <div className="card widget-flat">
                      <div className="card-body">

                          <div className="float-end">
                              <i className="mdi mdi-human-male-board widget-icon"></i>
                          </div>

                          <h5 className="text-muted fw-normal mt-0">
                              Teachers
                          </h5>

                          <h3 className="mt-3 mb-3">
                              86
                          </h3>

                          <p className="mb-0 text-muted">
                              <span className="text-success me-2">
                                  <i className="mdi mdi-arrow-up-bold"></i>
                                  2.10%
                              </span>

                              <span className="text-nowrap">
                                  Since last month
                              </span>
                          </p>

                      </div>
                  </div>
              </div>

              {/* Attendance */}
              <div className="col-lg-3 col-md-6">
                  <div className="card widget-flat">
                      <div className="card-body">

                          <div className="float-end">
                              <i className="mdi mdi-calendar-check widget-icon"></i>
                          </div>

                          <h5 className="text-muted fw-normal mt-0">
                              Attendance
                          </h5>

                          <h3 className="mt-3 mb-3">
                              94.5%
                          </h3>

                          <p className="mb-0 text-muted">
                              <span className="text-success me-2">
                                  <i className="mdi mdi-arrow-up-bold"></i>
                                  1.25%
                              </span>

                              <span className="text-nowrap">
                                  This month
                              </span>
                          </p>

                      </div>
                  </div>
              </div>

              {/* Fees */}
              <div className="col-lg-3 col-md-6">
                  <div className="card widget-flat">
                      <div className="card-body">

                          <div className="float-end">
                              <i className="mdi mdi-cash-multiple widget-icon"></i>
                          </div>

                          <h5 className="text-muted fw-normal mt-0">
                              Fees Collected
                          </h5>

                          <h3 className="mt-3 mb-3">
                              ₹6.25L
                          </h3>

                          <p className="mb-0 text-muted">
                              <span className="text-success me-2">
                                  <i className="mdi mdi-arrow-up-bold"></i>
                                  7.00%
                              </span>

                              <span className="text-nowrap">
                                  This month
                              </span>
                          </p>

                      </div>
                  </div>
              </div>

          </div>

          {/* Second Row */}
          <div className="row">

              {/* Recent Students */}
              <div className="col-xl-8">
                  <div className="card">
                      <div className="card-body">

                          <div className="dropdown float-end">
                              <button
                                  className="btn btn-sm btn-light"
                                  type="button"
                              >
                                  View All
                              </button>
                          </div>

                          <h4 className="header-title mb-3">
                              Recent Students
                          </h4>

                          <div className="table-responsive">
                              <table className="table table-centered table-nowrap table-hover mb-0">

                                  <thead>
                                      <tr>
                                          <th>Student</th>
                                          <th>Class</th>
                                          <th>Admission No.</th>
                                          <th>Status</th>
                                      </tr>
                                  </thead>

                                  <tbody>

                                      <tr>
                                          <td>
                                              <strong>
                                                  Rahul Sharma
                                              </strong>
                                          </td>

                                          <td>
                                              Class 10-A
                                          </td>

                                          <td>
                                              ADM-2026-001
                                          </td>

                                          <td>
                                              <span className="badge bg-success">
                                                  Active
                                              </span>
                                          </td>
                                      </tr>

                                      <tr>
                                          <td>
                                              <strong>
                                                  Priya Singh
                                              </strong>
                                          </td>

                                          <td>
                                              Class 9-B
                                          </td>

                                          <td>
                                              ADM-2026-002
                                          </td>

                                          <td>
                                              <span className="badge bg-success">
                                                  Active
                                              </span>
                                          </td>
                                      </tr>

                                      <tr>
                                          <td>
                                              <strong>
                                                  Amit Kumar
                                              </strong>
                                          </td>

                                          <td>
                                              Class 8-A
                                          </td>

                                          <td>
                                              ADM-2026-003
                                          </td>

                                          <td>
                                              <span className="badge bg-warning">
                                                  Pending
                                              </span>
                                          </td>
                                      </tr>

                                  </tbody>

                              </table>
                          </div>

                      </div>
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="col-xl-4">
                  <div className="card">
                      <div className="card-body">

                          <h4 className="header-title mb-3">
                              Quick Actions
                          </h4>

                          <div className="d-grid gap-2">

                              <button className="btn btn-primary">
                                  <i className="mdi mdi-account-plus me-1"></i>
                                  Add Student
                              </button>

                              <button className="btn btn-success">
                                  <i className="mdi mdi-human-male-board me-1"></i>
                                  Add Teacher
                              </button>

                              <button className="btn btn-info">
                                  <i className="mdi mdi-calendar-check me-1"></i>
                                  Mark Attendance
                              </button>

                              <button className="btn btn-warning">
                                  <i className="mdi mdi-cash me-1"></i>
                                  Collect Fees
                              </button>

                          </div>

                      </div>
                  </div>
              </div>

          </div>
      </>
  );
};

export default Dashboard;