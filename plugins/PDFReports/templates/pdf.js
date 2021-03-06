/*!
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

function formSetEditReport(idReport)
{
	var report = { 	"description":"", 
					"period":"week",
					"email_me":"1",
					"additional_emails":"",
					"reports":[]
	};
				
	if(idReport > 0)
	{
		report = piwik.PDFReports[idReport];
	}
	$('#report_description').html(report.description);
	$('#report_period option[value='+report.period+']').prop('selected', 'selected');
	$('#report_format option[value='+report.format+']').prop('selected', 'selected');
	$('#display_format option[value='+report.display_format+']').prop('selected', 'selected');
	if(report.email_me == 1)
	{
		$('#report_email_me').prop('checked','checked');
	}
	$('#report_additional_emails').text(report.additional_emails);
	
	$('#reportsList input').prop('checked', false);

	var key;
	for(key in report.reports)
	{
		$('#'+report.reports[key]).prop('checked','checked');
	}
	$('#report_idreport').val(idReport);
	$('#report_submit').val(piwik.updateReportString);
}

function getPDFAjaxRequest(idReport, defaultApiMethod)
{
	var parameters = {};
	piwikHelper.lazyScrollTo(".entityContainer", 400);
	parameters.idSite = piwik.idSite;
	parameters.module = 'API';
	parameters.method = defaultApiMethod;
	if(idReport == 0)
	{
		parameters.method =  'PDFReports.addReport';
	}
	parameters.format = 'json';
	parameters.token_auth = piwik.token_auth;
	return parameters;
}

function initManagePdf()
{
	// Click Add/Update Submit 
	$('#addEditReport').submit( function() {
		idReport = $('#report_idreport').val();
		parameters = getPDFAjaxRequest(idReport, 'PDFReports.updateReport');
		parameters.idReport = idReport;
		parameters.description = $('#report_description').val();
		parameters.period = $('#report_period option:selected').val();
		parameters.reportFormat = $('#report_format option:selected').val();
		parameters.displayFormat = $('#display_format option:selected').val();
		parameters.emailMe = $('#report_email_me').prop('checked') == true ? 1: 0;
		additionalEmails = $('#report_additional_emails').val();
		parameters.additionalEmails = piwikHelper.getApiFormatTextarea(additionalEmails);
		reports = '';
		$('#reportsList input:checked').each(function() {
			reports += $(this).attr('id') + ',';
		});
		parameters.reports = reports;

		var ajaxRequest = piwikHelper.getStandardAjaxConf();
		ajaxRequest.type = 'POST';
		ajaxRequest.data = parameters;
		$.ajax( ajaxRequest );
		return false;
	});
	
	// Email now
	$('a[name=linkEmailNow]').click(function(){
		var idReport = $(this).attr('idreport');
		var ajaxRequest = piwikHelper.getStandardAjaxConf();
		ajaxRequest.type = 'POST';
		parameters = getPDFAjaxRequest(idReport, 'PDFReports.sendEmailReport');
		parameters.idReport = idReport;
		parameters.period = broadcast.getValueFromUrl('period');
		parameters.date = broadcast.getValueFromUrl('date');
		ajaxRequest.data = parameters;
		$.ajax( ajaxRequest );
	});
	
	// Delete PDF
	$('a[name=linkDeleteReport]').click(function(){
		var idReport = $(this).attr('id');
		function onDelete()
		{
			var ajaxRequest = piwikHelper.getStandardAjaxConf();
			ajaxRequest.type = 'POST';
			parameters = getPDFAjaxRequest(idReport, 'PDFReports.deleteReport');
			parameters.idReport = idReport;
			ajaxRequest.data = parameters;
			$.ajax( ajaxRequest );
		}
		piwikHelper.modalConfirm( '#confirm', {yes: onDelete});
	});

	// Edit Report click
	$('a[name=linkEditReport]').click(function(){
		var idReport = $(this).attr('id');
		formSetEditReport( idReport );
		$('.entityAddContainer').show();
		$('#entityEditContainer').hide();
	});	
	
	// Add a Report click
	$('#linkAddReport').click(function(){
		$('.entityAddContainer').show();
		$('#entityEditContainer').hide();
		formSetEditReport( idReport = 0 );
	});
	
	// Cancel click
	$('.entityCancelLink').click(function(){
		$('.entityAddContainer').hide();
		$('#entityEditContainer').show();
		piwikHelper.hideAjaxError();
	}).click();
}
